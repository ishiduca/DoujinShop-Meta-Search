'use strict'
var React = require('react')
var StoreFavs = require('../stores/favs')
var Item      = require('./item')

module.exports = React.createClass({
    render: function () {
        return (
            <section id="favorites">
                <h3>favorites ({this.state.list.length || 0})</h3>
                <div className="items">
                    {
                        this.state.list.length ? this.state.list.map(m)
                                               : 'empty'
                    }
                </div>
            </section>
        )

        function m (fav) {
            return (
                <Item key={fav.urlOfTitle} data={fav} />
            )
        }
    }
  , getInitialState: function () {
        return {list: []}
    }
  , componentDidMount: function () {
        var me = this
        StoreFavs.on('change', function () {
            me.setState(getList())
        })
    }
})

function getList () {
    return {list: StoreFavs.getAll().sort(_sort)}
}

function _sort (a, b) {
    return a.rate > b.rate ? -1 : a.rate < b.rate ? 1 : 0
}
