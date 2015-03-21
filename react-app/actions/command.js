'use strict'
var printf       = require('printf')
var dispatcher   = require('../dispatcher')
var commands     = require('../commands').commands
var apiWebSocket = require('../api/ws')

module.exports = {
    write: function (str) {
        var data
        try {
            data = parseCommand(str)
        } catch (err) {
            return dispatcher.dispatch('command.parseError', err)
        }

        if ('help' in data) {
            return dispatcher.dispatch('help.showHelp')
        }

        apiWebSocket.send(data)

        dispatcher.dispatch('ws.send', data)
    }
}

function parseCommand (_str) {
    if ('' === _str) throw new Error('command not found')

    var str = _str.trim()
    if (':' !== str.slice(0, 1)) str = commands.mak + str

    for (var p in commands) {
        if (commands.hasOwnProperty(p)) {
            var command = commands[p]
            if (command === str.slice(0, command.length)) {
                var q = {}
                q[p] = str.slice(command.length).trim()
                return q
            }
        }
    }

    throw new Error(printf('can not parse "%s"', _str))
}
