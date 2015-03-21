'use strict'
var events       = require('events')
var assign       = require('object-assign')
var dispatcher   = require('../dispatcher')
var StoreWSState = module.exports = assign({}, events.EventEmitter.prototype)

var isopen = false

StoreWSState.isOpen = function () {
    return isopen
}

StoreWSState.dispatchToken = dispatcher.register(function (payload) {
    var actionType = payload.actionType
    var value      = payload.value

    if ('ws.onopen' === actionType) {
        isopen = true
        StoreWSState.emit('change')
    }

    if ('ws.onclose' === actionType) {
        isopen = false
        StoreWSState.emit('change')
    }
})
