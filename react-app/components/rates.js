'use strict'
var React = require('react')
var Rate  = require('./rate')
var Trash = require('./trash')

module.exports = React.createClass({
    render: function () {
        var me = this
        var id = this.props.data.urlOfTitle
        return (
            <div className="item-content-rate">
                {
                    this.state.classNames.map(m)
                }
                <span> : </span>
                <Trash id={id} />
            </div>
        )

        function m (classNames, i) {
            return (
                <Rate
                    key={i}
                    rate={i + 1}
                    id={id}
                    data={me.props.data}
                    className={classNames}
                    onRateMouseOver={me.handleMouseOver}
                    onRateMouseOut={ me.handleMouseOut}
                />
            )
        }
    }
  , getInitialState: function () {
        return {classNames: empty(this.props.rateMax, this.props.data.rate)}
    }
  , handleMouseOver: function (n) {
        this.setState({classNames: empty(this.props.rateMax, this.props.data.rate).map(m)})
        function m (classNames, i) {
            if (n > i) classNames += ' blink'
            return classNames
        }
    }
  , handleMouseOut: function () {
        this.setState({classNames: empty(this.props.rateMax, this.props.data.rate)})
    }
})

function empty (len, rate) {
    var a = []
    for (var i = 0; i < len; i++) {
        a.push(i < rate ? 'fa fa-lg fa-star' : 'fa fa-lg fa-star-o')
    }
    return a
}
