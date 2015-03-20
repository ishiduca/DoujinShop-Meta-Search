'use strict'
var dispatcher = require('../dispatcher')

module.exports = {
    open: function () {
        dispatcher.dispatch('ws.onopen')
    }
  , error: function (err) {
        dispatcher.dispatch('ws.onerror', err)
    }
  , close: function () {
        dispatcher.dispatch('ws.onclose')
    }
  , message: function (msg) {
        dispatcher.dispatch('ws.onmessage', msg)
    }
}
