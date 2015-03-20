'use strict'
var ApiWebSocket = require('./api/ws')
var ActWebSocket = require('./actions/ws')
var ActFavs      = require('./actions/favs')

window.onload = function () {
    ActFavs.buildup()

    ApiWebSocket.setup(function () {
        ApiWebSocket.onopen(   ActWebSocket.open)
        ApiWebSocket.onerror(  ActWebSocket.error)
        ApiWebSocket.onclose(  ActWebSocket.close)
        ApiWebSocket.onmessage(ActWebSocket.message)
    })
}

var React = require('react')
var App   = require('./components/app')

React.render(
    <App />
  , document.querySelector('#main')
)
