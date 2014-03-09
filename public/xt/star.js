function Rate (opt) {
	this.rate = []
	this.rate.length = opt.max

	this.stars = opt.stars
	this.now   = 0
}
Rate.prototype.stared = function (stars) {
	this.stars = stars || 0
	return this
}
Rate.prototype.hover = function (hover, stars) {
	this.now = hover ? stars : 0
	return this
}


;(function () {
    'use strict'

	var m = {}
	m.stars = []
	m.stars.push(new Rate({max : 10, stars: 2}))

    var stars = new Ractive({
        el: 'stars'
      , template: '#t-stars'
      , magic : true
      , data: m.stars[0]
    })
    stars.on({
        hover: function (ev, i) {
			m.stars[0].hover( ev.hover, i + 1 )
        }
      , stared: function (ev, i) {
	        m.stars[0].stared(i + 1)
        }
    })
})(this.self)
