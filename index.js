var io = require('socket.io-client')
  , buttons = require('./buttons')()

function blockUntilLoaded() {
  var loadingIndicator = document.querySelector('#loading-progress')
  if (!loadingIndicator || !loadingIndicator.style || loadingIndicator.style.display != 'none') {
    setTimeout(blockUntilLoaded, 100)
  } else {
    initialize()
  }
}

var socket
  , buttonState = { playPause: false
                  , rewind: false
                  , forward: false
                  }
  , isPlaying = false
function initialize() {
  socket = io.connect('http://localhost:3000/players')

  socket.on('connect', function() {
    console.log('connected!')
    socket.emit('buttons/play/state', buttonState.playPause)
      .emit('buttons/rewind/state', buttonState.rewind)
      .emit('buttons/forward/state', buttonState.forward)
      .emit('playing', isPlaying)
  }).on('play', function() {
    buttons.play()
  }).on('pause', function() {
    buttons.pause()
  }).on('rewind', function() {
    buttons.rewind()
  }).on('forward', function() {
    buttons.forward()
  })
}

buttons.on('playPauseDisabled', function(isDisabled) {
  buttonState.playPause = !isDisabled
  if (socket) {
    socket.emit('buttons/play/state', buttonState.playPause)
  }
}).on('rewindDisabled', function(isDisabled) {
  buttonState.rewind = !isDisabled
  if (socket) {
    socket.emit('buttons/rewind/state', buttonState.rewind)
  }
}).on('forwardDisabled', function(isDisabled) {
  buttonState.forward = !isDisabled
  if (socket) {
    socket.emit('buttons/forward/state', buttonState.forward)
  }
}).on('playing', function() {
  isPlaying = true
  if (socket) {
    socket.emit('playing', isPlaying)
  }
}).on('paused', function() {
  isPlaying = false
  if (socket) {
    socket.emit('playing', isPlaying)
  }
})

blockUntilLoaded()
