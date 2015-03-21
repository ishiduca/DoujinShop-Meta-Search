'use strict'
var events      = require('events')
var lodash      = require('lodash')
var assign      = require('object-assign')
var handle      = require('../utils/handle')
var StoreNotify = require('./notify')
var dispatcher  = require('../dispatcher')

var prefix  = '/DoujinShop/Meta/Search/favs'
var storage = require('../api/storage')(prefix)

var StoreFavs = module.exports = assign({}, events.EventEmitter.prototype)

handle.apply(StoreFavs, [{get: 'get'}, storage])
handle.apply(StoreFavs, [{getAll: 'vals'}, storage])
//handle.apply(StoreFavs, [{put: 'put'}, storage])
//handle.apply(StoreFavs, [{remove: 'remove'}, storage])

StoreFavs.dispatchToken = dispatcher.register(function (payload) {
    var actionType = payload.actionType
    var value      = payload.value

    if ('favs.buildup' === actionType) {
        StoreFavs.emit('change')
    }

    if ('favs.put' === actionType) {
        try {
            storage.put.apply(null, value)
        } catch (err) {
            StoreNotify.push(err)
            return StoreNotify.emit('change')
        }
        StoreFavs.emit('change')
    }

    if ('favs.remove' === actionType) {
        storage.remove(value)
        StoreFavs.emit('change')
    }
})
