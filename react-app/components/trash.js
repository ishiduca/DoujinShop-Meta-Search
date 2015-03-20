'use strict'
var printf  = require('printf')
var React   = require('react')
var ActFavs = require('../actions/favs')

var Trash = 'fa fa-trash-o fa-lg'
var Blink = 'blink'
var OnMouseOver = printf('%s %s', Trash, Blink)

module.exports = React.createClass({
    render: function () {
        return (
            <i
                className={this.state.classNames}
                onMouseOver={this.handleMouseOver}
                onMouseOut={this.handleMouseOut}
                onClick={this.handleClick}
            ></i>
        )
    }
  , getInitialState: function () {
        return mouseout()
    }
  , handleMouseOver: function () {
        this.setState(mouseover())
    }
  , handleMouseOut: function () {
        this.setState(mouseout())
    }
  , handleClick: function () {
        ActFavs.remove(this.props.id)
    }
})

function mouseout () {
    return {classNames: Trash}
}
function mouseover () {
    return {classNames: OnMouseOver}
}
