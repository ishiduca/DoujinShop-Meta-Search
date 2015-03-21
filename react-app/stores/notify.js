'use strict'
var events      = require('events')
var printf      = require('printf')
var assign      = require('object-assign')
var handle      = require('../utils/handle')
var dispatcher  = require('../dispatcher')
var StoreNotify = module.exports = assign({}, events.EventEmitter.prototype)
var buffer      = []

handle.apply(StoreNotify, [{get: 'shift'}, buffer])
handle.apply(StoreNotify, [{push: 'push'}, buffer]) // use StoreFavs error handle

StoreNotify.dispatchToken = dispatcher.register(function (payload) {
    var actionType = payload.actionType
    var value      = payload.value

    if ('ws.onopen' === actionType) {
        buffer.push('websocket.open')
        StoreNotify.emit('change')
    }

    if ('ws.onclose' === actionType) {
        buffer.push('websocket.close')
        StoreNotify.emit('change')
    }

    if ('ws.onerror' === actionType) {
        buffer.push(value)
        StoreNotify.emit('change')
    }

    if ('ws.onmessage' === actionType) {
        buffer.push(p(value))
        StoreNotify.emit('change')
    }

    if ('ws.send' === actionType) {
        buffer.push(printf('ws.send %O', value))
        StoreNotify.emit('change')
    }

    if ('command.parseError' === actionType) {
        buffer.push(value)
        StoreNotify.emit('change')
    }

    if ('favs.remove' === actionType) {
        buffer.push(printf('storage.remove "%s"', value))
        StoreNotify.emit('change')
    }

    if ('favs.put' === actionType) {
        var format = 'storage.put "%s" -> "%s"'
        buffer.push(printf(format, value[0], value[1].rate))
        StoreNotify.emit('change')
    }
})

function p (o) {
    return printf('%O service: %s (%s)'
      , o.request, o.service, o.response.length)
}
