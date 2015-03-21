'use strict'
var events     = require('events')
var assign     = require('object-assign')
var dispatcher = require('../dispatcher')
var StoreHelp  = module.exports = assign({}, events.EventEmitter.prototype)

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
