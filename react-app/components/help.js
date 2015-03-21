'use strict'
var React     = require('react')
var helps     = require('../commands').helps
var ActHelp   = require('../actions/help')
var StoreHelp = require('../stores/help')

var DisplayOff = 'display-off'
var DisplayOn  = 'display-on'

module.exports = React.createClass({
    render: function () {
        var me = this
        return (
            <section id="help">
                <div
                    id="help-content"
                    className={this.state.classNames}
                    onClick={this.handleClick}
                >
                    {
                        this.state.helps
                            ? (
                                <div>
                                    <h4>command help</h4>
                                    <dl>
                                        {Object.keys(this.state.helps).map(m)}
                                    </dl>
                                </div>
                              )
                            : ''
                    }
                </div>
            </section>
        )

        function m (key) {
            return (
                <div key={key}>
                    <dt>{key}</dt>
                    <dd>{me.state.helps[key]}</dd>
                </div>
            )
        }
    }
  , getInitialState: function () {
        return hidden()
    }
  , componentDidMount: function () {
        var me = this
        StoreHelp.on('change', function () {
            StoreHelp.get() ? me.setState(dispaly()) : me.setState(hidden())
        })
    }
  , handleClick: ActHelp.change.bind(ActHelp)
})

function hidden () {
    return {
        classNames: DisplayOff
    }
}

function dispaly () {
    return {
        classNames: DisplayOn
      , helps: helps
    }
}
