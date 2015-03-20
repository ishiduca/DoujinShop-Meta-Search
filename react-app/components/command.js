'use strict'
var React        = require('react')
var ActCommand   = require('../actions/command')
var StoreWSState = require('../stores/ws-state')

var COMMAND_LINE = 'command-line'

module.exports = React.createClass({
    render: function () {
        return (
            <section id="command">
                <form onSubmit={this.handleSubmit}>
                    <input
                        type="text"
                        placeholder={this.state.placeholder}
                        ref={COMMAND_LINE}
                        id={ COMMAND_LINE}
                        required
                        disabled={this.state.disabled}
                    />
                </form>
            </section>
        )
    }
  , handleSubmit: function (ev) {
        ev.preventDefault()
        ActCommand.write(this.getCommandDOMNode().value)
        this.initialize()
    }
  , getInitialState: function () {
        return disabled()
    }
  , componentDidMount: function () {
        var me = this
        StoreWSState.on('change', function () {
            if (StoreWSState.isOpen()) {
                me.setState(unDisabled())
                return me.initialize()
            }
            me.setState(disabled())
        })

        disabled()
    }
  , initialize: function () {
        var dom = this.getCommandDOMNode()
        dom.value = ''
        dom.focus()
    }
  , getCommandDOMNode: function () {
        return this.refs[COMMAND_LINE].getDOMNode()
    }
})

function disabled () {
    return {
        disabled: 'disabled'
      , placeholder: 'wait websocket connection...'
    }
}

function unDisabled () {
    return {
        disabled: ''
      , placeholder: '> input command'
    }
}
