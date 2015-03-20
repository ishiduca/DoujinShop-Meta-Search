'use strict'
var printf      = require('printf')
var React       = require('react')
var StoreNotify = require('../stores/notify')

var timeout    = 5000
var Info       = 'info'
var Err        = 'error'
var DisplayOff = 'display-off'
var DisplayOn  = 'display-on'

module.exports = React.createClass({
    render: function () {
        return (
            <section id="notify">
                <div
                    id="notify-content"
                    className={this.state.classNames}
                    onClick={  this.handleClick}
                >
                    {
                        this.state.message
                    }
                </div>
            </section>
        )
    }
  , handleClick: function () {
        this.setState(hidden())
    }
  , getInitialState: function () {
        return hidden()
    }
  , componentDidMount: function () {
        var me = this
        StoreNotify.on('change', function () {
            setTimeout(function () {
                me.setState(hidden())
            }, timeout)

            me.setState(display(StoreNotify.get()))
        })
    }
})

function hidden () {
    return {
        classNames: DisplayOff
      , message: ''
    }
}

function display (msg) {
    if (msg instanceof Error) {
        return {
            classNames: printf('%s %s', Err, DisplayOn)
          , message: String(msg)
        }
    }

    return {
        classNames: printf('%s %s', Info, DisplayOn)
      , message: printf('%O', msg)
    }
}
