'use strict'
var events      = require('events')
var printf      = require('printf')
var dispatcher  = require('../dispatcher')
var StoreNotify = module.exports = new events.EventEmitter

var buffer = []

StoreNotify.push = function (msg) {
    return buffer.push(msg)
}
StoreNotify.get = function () {
    return buffer.shift()
}

StoreNotify.dispatchToken = dispatcher.register(function (payload) {
    var actionType = payload.actionType
    var value      = payload.value

    if ('ws.onopen' === actionType) {
        StoreNotify.push('websocket.open')
        StoreNotify.emit('change')
    }

    if ('ws.onclose' === actionType) {
        StoreNotify.push('websocket.close')
        StoreNotify.emit('change')
    }

    if ('ws.onerror' === actionType) {
        StoreNotify.push(value)
        StoreNotify.emit('change')
    }

    if ('ws.onmessage' === actionType) {
        StoreNotify.push(p(value))
        StoreNotify.emit('change')
    }

    if ('ws.send' === actionType) {
        StoreNotify.push(printf('ws.send %O', value))
        StoreNotify.emit('change')
    }

    if ('command.parseError' === actionType) {
        StoreNotify.push(value)
        StoreNotify.emit('change')
    }

    if ('favs.remove' === actionType) {
        StoreNotify.push(printf('storage.remove "%s"', value))
        StoreNotify.emit('change')
    }

    if ('favs.put' === actionType) {
        var format = 'storage.put "%s" -> "%s"'
        StoreNotify.push(printf(format, value[0], value[1].rate))
        StoreNotify.emit('change')
    }
})

function p (o) {
    return printf('%O service: %s (%s)'
      , o.request, o.service, o.response.length)
}
