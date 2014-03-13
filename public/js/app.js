;(function (global) {
    'use strict'

    if (! global.console) global.console = {}
    if (! global.console.log) global.console.log = function () {}

    var DEBUG = /dev_mode=1/.test(global.location.search)

    var m  = {}
    var vm = {}

    vm.notify = new Ractive({
        el: 'l-notify'
      , template: '#t-notify'
      , data: {
            isMode:  ''
          , message: ''
          , isDisplayNone: true
        }
    })
    vm.notify.on('disp', function (ev) {
        this.set('isDisplayNone', true)
        this.set('message', '')
        this.set('isMode',  '')
    })


    m.router = new CommandLines()
    m.router.set(/^:(mak|nam|act|mch)\s+(.+)$/, function (reg) {
        var query = {}; query[reg[1]] = reg[2]
        m.ws.send(query)
        notif(query)
    })
    m.router.set(/^([^:].+)$/, function (reg) {
        this.parse(':mak ' + reg[1])
    })

    vm.search = new Ractive({
        el: 'l-search-form'
      , template: '#t-search-form'
      , data: { command: '' }
    })
    vm.search.on('search', function (ev) {
        try {
            m.router.parse(this.get('command'))
        } catch (err) {
            DEBUG && console.log(err.stack)
            notif(err, 'is-error')
        }

        this.set('command', '')
    })

    m.ws = new WebSocketWrapper({
        onerror: function (err) {
            DEBUG && console.log(err.stack)
            notif(err, 'is-error')
        }
      , onclose: function () {
            DEBUG && console.log('close')
            notif('websocket disconnected', 'is-websocket-disconnected')
        }
      , onopen: function () {
            DEBUG && console.log('open')
            notif('websocket connected', 'is-websocket-connect')
        }
      , onmessage: function (ev) {
            var data = JSON.parse(ev.data)
            DEBUG && console.log(data)

            if (data && data.error) {
                DEBUG && console.log(data.error)
                return notif(data.error, 'is-error')
            }

            var mess = []
            for (var i = 0, len = data.response.length; i < len; i++) {
                var id  = data.response[i].urlOfTitle
                var fav = m.favorites[id]
                data.response[i].star = fav ? rating(id, fav.star.stared) : rating(id, 0)
                mess.push(data.response[i].title)
            }

            notif('receive: [' + mess.join(', ') + ']')

            data.isDisplayNone = false
            m.results.unshift(data)
        }
    })


    try {
        m.lStorage  = new LocalStorageWrapper({key: 'DoujinShop::Meta::Search::dev'})
    } catch (err) {
        DEBUG && console.log(err.stack)
        notif(err, 'is-error')
    }
    m.lStorage || (m.lStorage = {})

    m.favorites = m.lStorage.getStorage()
    m.results   = []

    vm.main = new Ractive({
        el: 'l-main'
      , template: '#t-main'
      , data: {
            results: m.results
          , favorites: m.favorites
          , len: function (favorites) { return Object.keys(favorites).length }
          , filter: function (favorites) {
                return Object.keys(favorites).sort(function (a, b) {
                    var ta = favorites[a].star.stared
                    var tb = favorites[b].star.stared
                    return ta < tb ? 1 : ta > tb ? -1 : 0
                }).map(function (r) {
                    return favorites[r]
                })
            }
        }
    })
    vm.main.on({
        display: function (ev, i) {
            m.results[i].isDisplayNone = ! m.results[i].isDisplayNone
            this.update('results')
        }

      , highlight: function (ev, count, id, c, i) {
            if (Object.prototype.toString.apply(c) === '[object Number]') {
                m.results[i].response[c].star.onHover = ev.hover ? count + 1 : 0
                this.update('results')
            }

            else if (m.favorites[id]) {
                m.favorites[id].star.onHover = ev.hover ? count + 1 : 0
                this.update('favorites')
            }
        }

      , select: function (ev, count, id) {
            count += 1

            function search (id, cb) {
                m.results.forEach(function (result) {
                    result.response.forEach(function (response) {
                        response.urlOfTitle === id && cb(response)
                    })
                })
            }

            if (count > 0) {
                if (m.favorites[id]) {
                    m.favorites[id].star = rating(id, count)
                }

                search(id, function (response) {
                    response.star = rating(id, count)
                    m.favorites[id] || (m.favorites[id] = response)
                })

                notif('favoed "' + id + '" !')
            }

            else {
                search(id, function (response) {
                    response.star = rating(id, 0)
                })
                delete m.favorites[id]

                notif('unfavoed "' + id + '" !')
            }

            this.update('results')
            this.update('favorites')

            m.lStorage.save()
            DEBUG && console.log('[LocalStorageWrapper.save]')
        }
    })


    function notif (message, isMode) {
        var typeis = Object.prototype.toString.apply(message)
        if (typeis === '[object Object]') message = JSON.stringify(message)
        if (typeis === '[object Error]')  message = message.toString()

        vm.notify.set('isDisplayNone', false)
        vm.notify.set('message', message)
        vm.notify.set('isMode', isMode || 'is-info')
    }

    function rating (id, optStared) {
        return new Rate({
            id: id
          , stared: optStared || 0
          , length: 5
        })
    }

})(this.self)
