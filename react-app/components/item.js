'use strict'
var React = require('react')
var Rates = require('./rates')

var rateMax = 5

module.exports = React.createClass({
    render: function () {
        var data = this.props.data
        return (
            <div className="item-content">
                <a
                    href={data.urlOfTitle}
                    target="_blank"
                >
                    <img src={data.srcOfThumbnail} />
                </a>
                <a
                    href={data.urlOfTitle}
                    target="_blank"
                >
                    {data.title}
                </a>
                <span> / </span>
                {
                    data.urlOfCircle
                        ? (<a href={data.urlOfCircle} target="_blank">{data.circle}</a>)
                        : data.circle
                }
                <Rates rateMax={rateMax} data={data} />
            </div>
        )
    }
})
