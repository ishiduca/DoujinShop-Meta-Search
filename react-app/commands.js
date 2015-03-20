'use strict'
var lodash = require('lodash')
var printf = require('printf')

var helps = module.exports.helps = {
    mak: 'circle name'
  , act: 'author name'
  , nam: 'publish title'
  , mch: 'main charactor name'
  , gnr: 'genre(category)'
  , help: 'show help'
}

module.exports.commands = lodash.reduce(Object.keys(helps), function (cmds, key) {
    ;('help' !== key) ? (cmds[key] = printf(':%s ', key)) : (cmds[key] = ':help')
    return cmds
}, {})
