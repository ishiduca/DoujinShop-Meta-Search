'use strict'
var events         = require('events')
var dispatcher     = require('../dispatcher')
var StoreWSState = module.exports = new events.EventEmitter

var isopen = false

StoreWSState.isOpen = function () {
    return isopen
}
StoreWSState.open = function () {
    isopen = true
}
StoreWSState.close = function () {
    isopen = false
}

StoreWSState.dispatchToken = dispatcher.register(function (payload) {
    var actionType = payload.actionType
    var value      = payload.value

    if ('ws.onopen' === actionType) {
        StoreWSState.open()
        StoreWSState.emit('change')
    }

    if ('ws.onclose' === actionType) {
        StoreWSState.close()
        StoreWSState.emit('change')
    }
})
