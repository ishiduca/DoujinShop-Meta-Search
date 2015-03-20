'use strict'
var React   = require('react')
var ActFavs = require('../actions/favs')

module.exports = React.createClass({
	render: function () {
		return (
			<i
				className={this.props.className}
				onClick={    this.handleClick}
				onMouseOver={this.handleMouseOver}
				onMouseOut={ this.handleMouseOut}
			></i>
		)
	}
  , handleMouseOver: function () {
		this.props.onRateMouseOver(this.props.rate)
    }
  , handleMouseOut: function () {
		this.props.onRateMouseOut()
    }
  , handleClick: function () {
		ActFavs.put(this.props.id, this.props.data, this.props.rate)
    }
})
