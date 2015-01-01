(function(d){function g(){this.cmds=[]}function k(b,a){if("object"!==typeof b||null===b)throw Error('RequestArgumentsError: "option" not found');if(!b.uri)throw Error('RequestArgumentsError: "uri" not found');this.uri=b.uri;this.method=b.method||"GET";this.onResponse="function"===typeof a?a:function(){}}function h(b,a){a||(a={});var e=b.onclose||function(){},c=this;b.onclose=function(){e();setTimeout(function(){c.setup()},c.retryInterval)};this.url="ws://"+window.location.href.match(/^(?:http|https):\/\/([^\/]+)?\//)[1]+
"/_hippie/ws";this.listeners=b;this.retryConnect=a.retryConnect||10;this.retryInterval=a.retryInterval||2500;this.setup()}function a(b){if(!d.localStorage)throw Error("LocalStorageWrapperError: window.localstorage not found");if(!b||!b.key)throw Error('LocalStorageWrapperError: aurgment - "key" not found');this.key=b.key;this.load()}g.prototype.set=function(b,a){this.cmds.push([b,a]);return this};g.prototype.parse=function(b){if(b=b.replace(/^\s+/,"").replace(/\s+$/,""))for(var a=0,e=this.cmds.length;a<
e;a++){var c=this.cmds[a],f=b.match(c[0]);if(f)return c[1].apply(this,[f])}throw Error(["CommandLinesParseError",'can not parse this line "'+b+'"'].join(": "));};k.prototype.normalize=function(b){var a=this.uri,e;for(e in b)a=a.replace(":"+e,encodeURIComponent(b[e]));return a};k.prototype.send=function(a,d,e){a=this.normalize(d);var c=new XMLHttpRequest,f=this;c.onerror=function(a){f.onResponse(a,null)};c.onload=function(){try{f.onResponse(null,JSON.parse(c.responseText))}catch(a){f.onResponse(a,
null)}};c.open(this.method,a,!0);c.send(null)};h.prototype.setup=function(){if(0<=(this.retryConnect-=1)){this.ws=new WebSocket(this.url);for(var a in this.listeners)this.listeners.hasOwnProperty(a)&&(this.ws[a]=this.listeners[a])}};h.prototype.send=function(a){this.ws.send("[object Object]"===Object.prototype.toString.apply(a)?JSON.stringify(a):a)};a.prototype.load=function(){this._=JSON.parse(d.localStorage.getItem(this.key))||{}};a.prototype.save=function(){d.localStorage.setItem(this.key,JSON.stringify(this._))};
a.prototype.getStorage=function(){return this._};d.LocalStorageWrapper=a;d.WebSocketWrapper=h;d.CommandLines=g;d.Request=k;d.Rate=function(a){this.rate=[];this.rate.length=a.length;this.id=a.id;this.onHover=0;this.stared=a.stared}})(this.self);(function(d){function g(a,c){var f=Object.prototype.toString.apply(a);"[object Object]"===f&&(a=JSON.stringify(a));"[object Error]"===f&&(a=a.toString());b.notify.set("isDisplayNone",!1);b.notify.set("message",a);b.notify.set("isMode",c||"is-info")}function k(a,c){return new Rate({id:a,stared:c||0,length:5})}d.console||(d.console={});d.console.log||(d.console.log=function(){});var h=/dev_mode=1/.test(d.location.search),a={},b={};b.notify=new Ractive({el:"l-notify",template:"#t-notify",data:{isMode:"",
message:"",isDisplayNone:!0}});b.notify.on("disp",function(a){this.set("isDisplayNone",!0);this.set("message","");this.set("isMode","")});a.router=new CommandLines;a.router.set(/^:(mak|nam|act|mch|gnr)\s+(.+)$/,function(e){var c={};c[e[1]]=e[2];a.ws.send(c);g(c)});a.router.set(/^([^:].+)$/,function(a){this.parse(":mak "+a[1])});b.search=new Ractive({el:"l-search-form",template:"#t-search-form",data:{command:""}});b.search.on("search",function(e){try{a.router.parse(this.get("command"))}catch(c){h&&console.log(c.stack),
g(c,"is-error")}this.set("command","")});a.ws=new WebSocketWrapper({onerror:function(a){h&&console.log(a.stack);g(a,"is-error")},onclose:function(){h&&console.log("close");g("websocket disconnected","is-websocket-disconnected")},onopen:function(){h&&console.log("open");g("websocket connected","is-websocket-connect")},onmessage:function(e){e=JSON.parse(e.data);h&&console.log(e);if(e&&e.error)return h&&console.log(e.error),g(e.error,"is-error");for(var c=[],b=0,d=e.response.length;b<d;b++){var l=e.response[b].urlOfTitle,
n=a.favorites[l];e.response[b].star=n?k(l,n.star.stared):k(l,0);c.push(e.response[b].title)}g("receive: ["+c.join(", ")+"]");e.isDisplayNone=!1;a.results.unshift(e)}});try{a.lStorage=new LocalStorageWrapper({key:"DoujinShop::Meta::Search::dev"})}catch(m){h&&console.log(m.stack),g(m,"is-error")}a.lStorage||(a.lStorage={});a.favorites=a.lStorage.getStorage();a.results=[];b.main=new Ractive({el:"l-main",template:"#t-main",data:{results:a.results,favorites:a.favorites,len:function(a){return Object.keys(a).length},
filter:function(a){return Object.keys(a).sort(function(c,b){var d=a[c].star.stared,l=a[b].star.stared;return d<l?1:d>l?-1:0}).map(function(b){return a[b]})}}});b.main.on({display:function(b,c){a.results[c].isDisplayNone=!a.results[c].isDisplayNone;this.update("results")},highlight:function(b,c,f,d,l){"[object Number]"===Object.prototype.toString.apply(d)?(a.results[l].response[d].star.onHover=b.hover?c+1:0,this.update("results")):a.favorites[f]&&(a.favorites[f].star.onHover=b.hover?c+1:0,this.update("favorites"))},
select:function(b,c,f){function d(b,c){a.results.forEach(function(a){a.response.forEach(function(a){a.urlOfTitle===b&&c(a)})})}c+=1;0<c?(a.favorites[f]&&(a.favorites[f].star=k(f,c)),d(f,function(b){b.star=k(f,c);a.favorites[f]||(a.favorites[f]=b)}),g('favoed "'+f+'" !')):(d(f,function(a){a.star=k(f,0)}),delete a.favorites[f],g('unfavoed "'+f+'" !'));this.update("results");this.update("favorites");a.lStorage.save();h&&console.log("[LocalStorageWrapper.save]")}})})(this.self);
