var EventEmitter = require('events').EventEmitter
  , util = require('util')
  , observe = require('./observe')

function Buttons() {
  EventEmitter.call(this)
  this._repeatBtn = document.querySelector('.player-middle button[data-id="repeat"]')
  this._rewindBtn = document.querySelector('.player-middle button[data-id="rewind"]')
  this._playPauseBtn = document.querySelector('.player-middle button[data-id="play-pause"]')
  this._forwardBtn = document.querySelector('.player-middle button[data-id="forward"]')
  this._shuffleBtn = document.querySelector('.player-middle button[data-id="shuffle"]')

  if (!this._repeatBtn || !this._rewindBtn || !this._playPauseBtn || !this._forwardBtn ||
    !this._shuffleBtn) {
    throw new Error('Could not find necessary buttons')
  }

  this._disabledObserver = observe([this._rewindBtn, this._playPauseBtn, this._forwardBtn],
    { attributes: true
    , attributeFilter: ['disabled']
    })

  this._disabledObserver.on('mutation', function(mutationList) {
    var targets = getUniqueTargets(mutationList)
    targets.forEach(this._emitDisabledState, this)
  }.bind(this))

  this._playingStateObserver = observe(this._playPauseBtn,
    { attributes: true
    , attributeFilter: ['class']
    }).on('mutation', function(mutationList) {
      this._emitPlayingState()
    }.bind(this))

  // emit events for the current state, so that users of this class can rely on only
  // events for their state tracking
  setTimeout(function() {
    ;[this._rewindBtn, this._playPauseBtn, this._forwardBtn].forEach(this._emitDisabledState, this)
    this._emitPlayingState()
  }.bind(this), 0)
}
util.inherits(Buttons, EventEmitter)

Buttons.prototype._emitDisabledState = function(buttonElem) {
  var isDisabled = buttonElem.disabled
    , eventName
  switch (buttonElem.dataset.id) {
    case 'play-pause': eventName = 'playPause'; break;
    case 'rewind': eventName = 'rewind'; break;
    case 'forward': eventName = 'forward'; break;
    default: return this.emit('error', new Error('Invalid button was mutated'))
  }
  eventName = eventName + 'Disabled'
  this.emit(eventName, isDisabled)
}

Buttons.prototype._emitPlayingState = function() {
  this.emit(this._isPlaying() ? 'playing' : 'paused')
}

Buttons.prototype._isPlaying = function() {
  return this._playPauseBtn.classList.contains('playing')
}

Buttons.prototype.play = function() {
  if (this._isPlaying()) {
    return
  }

  this._playPauseBtn.click()
}

Buttons.prototype.pause = function() {
  if (!this._isPlaying()) {
    return
  }

  this._playPauseBtn.click()
}

Buttons.prototype.rewind = function() {
  this._rewindBtn.click()
}

Buttons.prototype.forward = function() {
  this._forwardBtn.click()
}

Buttons.prototype._isShuffled = function() {
  return this._shuffleBtn.value == 'ALL_SHUFFLE'
}

Buttons.prototype.shuffle = function() {
  if (this._isShuffled()) {
    return
  }

  this._shuffleBtn.click()
}

Buttons.prototype.unshuffle = function() {
  if (!this._isShuffled()) {
    return
  }

  this._shuffleBtn.click()
}

Buttons._repeatStates = [ 'none', 'single', 'list' ]

Buttons.prototype._getRepeatState = function() {
  var state = this._repeatBtn.value
  switch(state) {
    case 'SINGLE_REPEAT': return 'single'
    case 'LIST_REPEAT': return 'list'
    default: return 'none'
  }
}

Buttons.prototype._toggleRepeatTo = function(state) {
  var curState = this._getRepeatState()
  if (curState == state) {
    return
  }

  var stateIndex = Buttons._repeatStates.indexOf(state)
  if (stateIndex == -1) {
    throw new Error('Invalid state')
  }
  for (; Buttons._repeatStates[stateIndex] != curState;
    stateIndex = (stateIndex + 1) % Buttons.repeatStates.length) {
    this._repeatBtn.click()
  }
}

Buttons.prototype.disableRepeat = function() {
  this._toggleRepeatTo('none')
}

Buttons.prototype.repeatOne = function() {
  this._toggleRepeatTo('single')
}

Buttons.prototype.repeatAll = function() {
  this._toggleRepeatTo('list')
}

function getUniqueTargets(mutationList) {
  var seen = []
  return mutationList.map(function(mutation) {
    return mutation.target
  }).filter(function(target) {
    if (seen.indexOf(target.dataset.id) == -1) {
      seen.push(target.dataset.id)
      return true
    } else {
      return false
    }
  })
}

module.exports = function() {
  return new Buttons()
}
