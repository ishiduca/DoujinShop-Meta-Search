;(function (global) {
    'use strict'

    if (! global.console) console = {}
    if (! global.console.log) console.log = function () {}

    var DEBUG = /dev_mode=1/.test(global.location.search)

    var r = {}
    var m = {}
    var v = {}

    function onResponse (err, res) {
        if (err) {
            console.log(err.stack)
            notif(err.toString(), 'is-error')
            return
        }

        res.response = res.response.map(function (response) {
            var id  = response.urlOfTitle
            var fav = m.favorites[ id ]

            if (fav) return fav

            response.star = new Rate({
                id:     id
              , length: 5
              , stared: 0
            })

            return response
        })

        res.isDisplayNone = false /* required */
        m.results.unshift(res)
    }

    v.requests = {
        zin: new Request({
            uri: '/service/zin/name/:val'
          , method: 'GET'
        }, onResponse)
      , tora: new Request({
            uri: '/service/tora/:key/:val'
          , method: 'GET'
        }, onResponse)
      , melon: new Request({
            uri: '/service/melon/:key/:val'
          , method: 'GET'
        }, onResponse)
    };


    m.storage = new LocalStorageWrapper({
        key: 'DoujinShop::Meta::Search::favorites'
    })
    m.favorites = m.storage.getStorage()
    m.results   = []

    m.cmds = new CommandLines()
    m.cmds.set(/^:(nam|mak|mch|act)\s+(.+)$/, function (reg) {
        Object.keys(v.requests).forEach(function (service) {
            var req = v.requests[service]
            req.send(service, {key: reg[1], val: reg[2]})
            notif('"' + service + '" request "' + reg[1] + '" => "' + reg[2] + '"')
        })
    })
    .set(/^([^:].+)$/, function (reg) {
        this.parse(':mak ' + reg[1])
    })


    r.notify = new Ractive({
        el: 'l-notify'
      , template: '#t-notify'
      , data: {isDisplayNone: true}
    })
    r.notify.on('disp', function (ev) {
        this.set('isDisplayNone', true);
        this.set('message', '');
        this.set('isMode', '');
    })

    function notif (message, isMode) {
        r.notify.set('isDisplayNone', true)
        r.notify.set('message', !! message ? message : '')
        r.notify.set('isMode', isMode || 'is-info')
    }

    r.search = new Ractive({
        el: 'l-search-form'
      , template: '#t-search-form'
    })
    r.search.on('search', function (ev) {
        try {
            m.cmds.parse(this.get('command'))
        } catch (err) {
            notif(err.toString(), 'is-error')
        }

        this.set('command', '')
    })


    r.contain = new Ractive({
        el:        'l-contain'
      , template: '#t-contain'
      , data: {
            results:   m.results
          , favorites: m.favorites
          , len: function (favorites) { return Object.keys(favorites).length }
          , toList: function (favorites) {
                return Object.keys(favorites).map(function (key) {
                    return favorites[key]
                })
            }
        }
    })
    r.contain.on({
        showDisplay: function (ev, i) {
            m.results[i].isDisplayNone = ! m.results[i].isDisplayNone
            r.contain.update('results')
        }

      , select: function (ev, count, id) {
            count += 1
            if (count > 0) {
                if (m.favorites[id]) {
                    m.favorites[id].star = new Rate({
                        id: id
                      , length: 5
                      , stared: count
                    })
                }

                search(id, function (response) {
                    response.star = new Rate({
                        id: id
                      , length: 5
                      , stared: count
                    })
                    m.favorites[id] || (m.favorites[id] = response)
                })

            } else {
                search(id, function (response) {
                    response.star = new Rate({
                        id:     id
                      , length: 5
                      , stared: 0
                    })
                })
                delete m.favorites[id]
            }

            this.update('results')
            this.update('favorites')

            m.storage.save()

            function search (id, cb) {
                m.results.forEach(function (res) {
                    res.response.forEach(function (response) {
                        id === response.urlOfTitle && cb(response)
                    })
                })
            }
        }

      , highlight: function (ev, count, id, c, i) {
            if (Object.prototype.toString.apply(c) === '[object Number]') {
                m.results[i].response[c].star.onHover = ev.hover ? count + 1 : 0
                this.update('results')
            }

            else {
                m.favorites[id] && (m.favorites[id].star.onHover = ev.hover ? count + 1 : 0)
                this.update('favorites')
            }
        }
    })

})(this.self)
