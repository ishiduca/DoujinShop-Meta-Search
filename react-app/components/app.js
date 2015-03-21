'use strict'
var React = require('react')
var Command = require('./command')
var Notify  = require('./notify')
var Help    = require('./help')
var Favs    = require('./favs')
var Result  = require('./result')

module.exports = React.createClass({
    render: function () {
        return (
            <section>
                <Command />
                <Notify />
                <Help />
                <section id="main-content">
                    <Result />
                    <Favs />
                </section>
            </section>
        )
    }
})
