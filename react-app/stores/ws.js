'use strict'
var events         = require('events')
var lodash         = require('lodash')
var assign         = require('object-assign')
var printf         = require('printf')
var dispatcher     = require('../dispatcher')
var StoreWebSocket = module.exports = assign({}, events.EventEmitter.prototype)

var list = []

StoreWebSocket.getAll = function () {
    return lodash.cloneDeep(list)
}

StoreWebSocket.dispatchToken = dispatcher.register(function (payload) {
    var actionType = payload.actionType
    var value      = payload.value

    if ('ws.onmessage' === actionType) {
        list.push(value)
        StoreWebSocket.emit('change')
    }

})
