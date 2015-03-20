'use strict'
var loc      = window.location
var protocol = 'https:' === loc.protocol ? 'wss:' : 'ws:'
var uri      = [protocol, '//', loc.host, '/_hippie/ws'].join('')
var ws
var timeout  = 1500

var onSetup
var onError = function (err) { console.log(err) } // dummy

var api = module.exports = {
    setup: setup
  , onopen: onopen
  , onerror: onerror
  , onclose: onclose
  , onmessage: onmessage
  , send: send
}

function setup (f) {
    onSetup = function () {
        ws = new WebSocket(uri)
        f()
    }

    onSetup()
}

function onopen (f) {
    ws.onopen = function () {
        f.apply(this, arguments)
    }
}
function onerror (f) {
    onError = f
    ws.onerror = function (err) {
        f.apply(this, [err])
    }
}
function onclose (f) {
    ws.onclose = function () {
        setTimeout(onSetup, timeout)
        f.apply(this, arguments)
    }
}
function onmessage (f) {
    ws.onmessage = function (ev) {
        var data
        try {
            data = JSON.parse(ev.data)
        } catch (err) {
            return onError.apply(this, [err])
        }

        if (data.error) {
            return onError.apply(this, [new Error(data.error)])
        }

        f.apply(this, [data])
    }
}
function send (data) {
    ws.send(JSON.stringify(data))
}
