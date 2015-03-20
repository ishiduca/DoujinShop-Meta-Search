'use strict'
var events      = require('events')
var lodash      = require('lodash')
var StoreNotify = require('./notify')
var dispatcher  = require('../dispatcher')

var prefix  = '/DoujinShop/Meta/Search/favs'
var storage = require('../api/storage')(prefix)

var StoreFavs = module.exports = new events.EventEmitter

StoreFavs.get = function (id) {
    return storage.get(id)
}
StoreFavs.put = function (id, val) {
    return storage.put(id, val)
}
StoreFavs.remove = function (id) {
    return storage.remove(id)
}
StoreFavs.getAll = function () {
    return storage.vals()
}

StoreFavs.dispatchToken = dispatcher.register(function (payload) {
    var actionType = payload.actionType
    var value      = payload.value

    if ('favs.buildup' === actionType) {
        StoreFavs.emit('change')
    }

    if ('favs.put' === actionType) {
        try {
            StoreFavs.put.apply(null, value)
        } catch (err) {
            StoreNotify.push(err)
            return StoreNotify.emit('change')
        }
        StoreFavs.emit('change')
    }

    if ('favs.remove' === actionType) {
        console.log(value)
        StoreFavs.remove(value)
        StoreFavs.emit('change')
    }
})
