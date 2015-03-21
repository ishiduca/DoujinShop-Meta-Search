'use strict'
var events     = require('events')
var dispatcher = require('../dispatcher')
var StoreHelp  = module.exports = new events.EventEmitter

var flg = false

StoreHelp.get = function () {
    return flg
}

StoreHelp.dispatchToken = dispatcher.register(function (payload) {
    if ('help.showHelp' === payload.actionType) {
        flg = ! flg
        StoreHelp.emit('change')
    }
})
