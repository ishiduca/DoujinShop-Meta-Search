'use strict'
module.exports = function (prefix) {
    prefix = String(prefix).replace(/!/g, '!!') + '!'

    var storage = window.localStorage

    return { // api
        get: get
      , put: put
      , remove: remove
      , keys: keys
      , vals: vals
    }

    function replaceKey (_key) {
        return prefix + String(_key)
    }

    function get (_key) {
        return JSON.parse(storage.getItem(replaceKey(_key)))
    }

    function put (_key, _val) {
        storage.setItem(replaceKey(_key), JSON.stringify(_val))
    }

    function remove (_key) {
        storage.removeItem(replaceKey(_key))
    }

    function keys () {
        var i = -1
        var len = storage.length
        var ks = []
        while (++i < len) {
            var key = storage.key(i)
            if (key.slice(0, prefix.length) === prefix) {
                ks.push(key.slice(prefix.length))
            }
        }
        return ks.sort()
    }

    function vals (srt) {
        return keys().map(function (key) {
            return get(key)
        }).sort('function' === typeof srt ? srt : _sort)
    }

    function _sort (A, B) {
        var a = A.title.toLowerCase()
        var b = B.title.toLowerCase()
        return (a > b) ? 1 : (b > a) ? -1 : 0
    }
}
