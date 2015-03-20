'use strict'
var lodash     = require('lodash')
var dispatcher = require('../dispatcher')

module.exports = {
    buildup: function () {
        dispatcher.dispatch('favs.buildup')
    }
  , put: function (id, res, rate) {
        dispatcher.dispatch('favs.put', [id, merge(res, rate)])
    }
  , remove: function (id) {
        dispatcher.dispatch('favs.remove', id)
    }
}

function merge (_res, rate) {
    var res = lodash.cloneDeep(_res)
    res.rate = rate
    return res
}
