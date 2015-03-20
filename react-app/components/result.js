'use strict'
var printf         = require('printf')
var lodash         = require('lodash')
var React          = require('react')
var StoreWebSocket = require('../stores/ws')
var StoreFavs      = require('../stores/favs')
var Item           = require('./item')

module.exports = React.createClass({
    render: function () {
        return (
            <section id="result">
                <h3>results</h3>
                <dl id="result-content">
                    {
                        this.state.results.length
							? this.state.results.map(m)
                            : 'empty'
                    }
                </dl>
            </section>
        )

        function m (o) {
            var method = Object.keys(o.request)[0]
            var key = printf('%s-%s-%s-%s'
                    , method,     encodeURIComponent(o.request[method])
					, o.service,  o.rateSum)
			var dt  = printf('%O service: %s (%d)'
			        , o.request, o.service, o.response.length)

            return (
                <div key={key}>
                    <dt>{dt}</dt>
                    <dd>
						{
							o.response.map(mm)
						}
					</dd>
                </div>
            )
        }

		function mm (res) {
			return (
				<Item key={res.urlOfTitle} data={res} />
			)
		}
    }
  , getInitialState: function () {
        return {results: []}
    }
  , componentDidMount: function () {
        var me = this
        StoreWebSocket.on('change', function () {
            me.setState({results: getList()})
        })
		StoreFavs.on('change', function () {
            me.setState({results: getList()})
		})
    }
})

function getList () {
    return StoreWebSocket.getAll().reverse().map(m)

    function m (o) {
        o.rateSum  = 0
        o.response = o.response.map(function (_res) {
            var res = lodash.cloneDeep(_res)
            var fav = StoreFavs.get(res.urlOfTitle)
            o.rateSum += (res.rate = fav ? fav.rate : 0)
            return res
        })
        return o
    }
}
