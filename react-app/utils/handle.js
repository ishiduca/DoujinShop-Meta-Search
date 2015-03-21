// ex
// var assign = require('object-assign')
// var events = require('events')
// var handle = require('path/to/handle')
// var Store  = assign({}, events.EventEmitter.prototype)
// var list   = []
// handle.apply(Store, [{get: 'shift'}, list])
//
// Store.on('change', function () {
//     console.log(Store.get())
// })
//
//  list.push('hello')
//  Store.emit('change')


module.exports = handle

function handle (pair, she) {
    if (! she) throw new Error('target not found')

    var targetMethod = Object.keys(pair)[0]
    var herMethod    = pair[targetMethod]

    if ('function' === typeof she[herMethod]) {
        this[targetMethod] = function () {
            return she[herMethod].apply(she, arguments)
        }
        return true
    }

    return false
}
