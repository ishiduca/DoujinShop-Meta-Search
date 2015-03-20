'use strict'
var events         = require('events')
var lodash         = require('lodash')
var printf         = require('printf')
var dispatcher     = require('../dispatcher')
var StoreWebSocket = module.exports = new events.EventEmitter

var list = []

StoreWebSocket.push = function (data) {
    return list.push(data)
}
StoreWebSocket.getAll = function () {
    return lodash.cloneDeep(list)
}

StoreWebSocket.dispatchToken = dispatcher.register(function (payload) {
    var actionType = payload.actionType
    var value      = payload.value

    if ('ws.onmessage' === actionType) {
        if (StoreWebSocket.push(value)) {
            StoreWebSocket.emit('change')
        }
    }

})
