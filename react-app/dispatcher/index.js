'use strict'
var dispatcher = module.exports = new (require('flux').Dispatcher)
var dispatch   = dispatcher.dispatch

dispatcher.dispatch = function (actionType, value) {
    var payload = {actionType: actionType}
    if ('undefined' !== typeof value) payload.value = value
    return dispatch.apply(this, [payload])
}
