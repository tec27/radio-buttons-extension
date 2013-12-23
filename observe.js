var util = require('util')
  , EventEmitter = require('events').EventEmitter

function Observer(domNodes, options) {
  EventEmitter.call(this)
  this._observer = new MutationObserver(function(mutation) {
    this.emit('mutation', mutation)
  }.bind(this))

  if (util.isArray(domNodes)) {
    domNodes.forEach(function(node) {
      this._observer.observe(node, options)
    }, this)
  } else {
    this._observer.observe(domNodes, options)
  }
}
util.inherits(Observer, EventEmitter)

Observer.prototype.disconnect = function() {
  if (!this._observer) {
    return
  }
  this._observer.disconnect()
  this._observer = null
  this.emit('disconnected')
}

module.exports = function(domNodes, options) {
  return new Observer(domNodes, options)
}
