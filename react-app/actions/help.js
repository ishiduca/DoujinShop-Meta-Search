'use strict'
var dispatcher = require('../dispatcher')

module.exports = {
    change: function () {
        dispatcher.dispatch('help.showHelp')
    }
}
