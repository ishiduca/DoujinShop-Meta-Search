;(function (global) {
    'use strict'

    var isBrowser = !! global.self
    var isWorker  = !! global.WorkerLocation

    function CommandLines () { this.cmds = [] }

    CommandLines.prototype.set = function (reg, cb) {
        this.cmds.push([ reg, cb ]);
        return this
    }

    CommandLines.prototype.parse = function (str) {
        if (str = str.replace(/^\s+/, '').replace(/\s+$/, '')) {
            for (var i = 0, len = this.cmds.length; i < len; i++) {
                var cmd = this.cmds[i]
                var res = str.match(cmd[0])
                if (!! res) return cmd[1].apply(this, [res])
            }
        }

        throw new Error([
            'CommandLinesParseError'
          , 'can not parse this line "' + str + '"'
        ].join(': '))
    }


    function Request (option, onResponse) {
        if (typeof option !== 'object' || option === null) {
            throw new Error(['RequestArgumentsError', '"option" not found'].join(': '))
        }

        if (! option.uri) {
            throw new Error(['RequestArgumentsError', '"uri" not found'].join(': '))
        }

        this.uri    = option.uri
        this.method = option.method || 'GET'
        this.onResponse = typeof onResponse === 'function'
                        ? onResponse
                        : function () {}
    }

    Request.prototype.normalize = function (arg) {
        var uri = this.uri
        for (var prop in arg) {
            uri = uri.replace(':' + prop, encodeURIComponent(arg[prop]))
        }
        return uri
    }

    Request.prototype.send = function (service, arg, option) {
        var uri  = this.normalize(arg)
        var xhr  = new XMLHttpRequest
        var body = null
        var that = this

        xhr.onerror = function (err) { that.onResponse(err, null) }
        xhr.onload  = function () {
            that.onResponse(null, JSON.parse(xhr.responseText))
        }

        xhr.open(this.method, uri, true)
        xhr.send(body)
    }


    function LocalStorageWrapper (opt) {
        if (! global.localStorage) {
            throw new Error([
                'LocalStorageWrapperError'
              , 'window.localstorage not found'
            ].join(': '))
        }

        if (! opt || ! opt.key) {
            throw new Error([
                'LocalStorageWrapperError'
              , 'aurgment - "key" not found'
            ].join(': '))
        }

        this.key = opt.key
        this.load()
    }

    LocalStorageWrapper.prototype.load = function () {
        this._ = JSON.parse(global.localStorage.getItem(this.key)) || {}
    }

    LocalStorageWrapper.prototype.save = function () {
        global.localStorage.setItem(this.key, JSON.stringify(this._))
    }

    LocalStorageWrapper.prototype.getStorage = function () { return this._ }


    function Rate (opt) {
        this.rate    = []; this.rate.length = opt.length
        this.id      = opt.id
        this.onHover = 0
        this.stared  = opt.stared
    }

    global.LocalStorageWrapper = LocalStorageWrapper
    global.CommandLines = CommandLines
    global.Request      = Request
    global.Rate         = Rate   

})(this.self)
