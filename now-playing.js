var EventEmitter = require('events').EventEmitter
  , util = require('util')
  , observe = require('./observe')

function NowPlaying() {
  EventEmitter.call(this)
  this._songInfoElem = document.querySelector('#playerSongInfo')
  if (!this._songInfoElem) {
    throw new Error('Could not find now playing element')
  }

  this._childListener = observe(this._songInfoElem,
    { childList: true
    , subtree: true
    }).on('mutation', function(mutationList) {
      this._emitNowPlaying()
    }.bind(this))

  // emit the current state to initialize any listeners
  setTimeout(function() {
    this._emitNowPlaying()
  }.bind(this), 0)
}
util.inherits(NowPlaying, EventEmitter)

NowPlaying.prototype._emitNowPlaying = function() {
  var data =  { art: this.getAlbumArt()
              , title: this.getSongTitle()
              , artist: this.getSongArtist()
              , album: this.getSongAlbum()
              }
  this.emit('nowPlaying', data)
}

NowPlaying.prototype.getAlbumArt = function() {
  var elem = this._songInfoElem.querySelector('#playingAlbumArt')
  if (!elem) return null
  return elem.src
}

NowPlaying.prototype.getSongTitle = function() {
  var elem = this._songInfoElem.querySelector('#playerSongTitle')
  if (!elem) return null
  return elem.textContent
}

NowPlaying.prototype.getSongArtist = function() {
  var elem = this._songInfoElem.querySelector('#player-artist')
  if (!elem) return null
  return elem.textContent
}

NowPlaying.prototype.getSongAlbum = function() {
  var elem = this._songInfoElem.querySelector('.player-album')
  if (!elem) return null
  return elem.textContent
}

module.exports = function() {
  return new NowPlaying()
}
