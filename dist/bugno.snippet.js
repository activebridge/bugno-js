!function(n){var e={};function o(t){if(e[t])return e[t].exports;var r=e[t]={i:t,l:!1,exports:{}};return n[t].call(r.exports,r,r.exports,o),r.l=!0,r.exports}o.m=n,o.c=e,o.d=function(n,e,t){o.o(n,e)||Object.defineProperty(n,e,{enumerable:!0,get:t})},o.r=function(n){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(n,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(n,"__esModule",{value:!0})},o.t=function(n,e){if(1&e&&(n=o(n)),8&e)return n;if(4&e&&"object"==typeof n&&n&&n.__esModule)return n;var t=Object.create(null);if(o.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:n}),2&e&&"string"!=typeof n)for(var r in n)o.d(t,r,function(e){return n[e]}.bind(null,r));return t},o.n=function(n){var e=n&&n.__esModule?function(){return n.default}:function(){return n};return o.d(e,"a",e),e},o.o=function(n,e){return Object.prototype.hasOwnProperty.call(n,e)},o.p="",o(o.s=0)}([function(n,e,o){var t=o(1),r=o(4);_bugnoConfig=_bugnoConfig||{},_bugnoConfig.bugnoJsUrl=_bugnoConfig.bugnoJsUrl||"https://cdnjs.cloudflare.com/ajax/libs/bugno.js/0.1.0/bugno.min.js",_bugnoConfig.async=void 0===_bugnoConfig.async||_bugnoConfig.async;var i=t.setupShim(window,_bugnoConfig),a=r(_bugnoConfig);window.bugno=t.Bugno,i.loadFull(window,document,!_bugnoConfig.async,_bugnoConfig,a)},function(n,e,o){var t=o(2);function r(n){return function(){try{return n.apply(this,arguments)}catch(n){try{console.error("[Bugno]: Internal error",n)}catch(n){}}}}var i=0;function a(n,e){this.options=n,this._bugnoOldOnError=null;var o=i++;this.shimId=function(){return o},"undefined"!=typeof window&&window._bugnoShims&&(window._bugnoShims[o]={handler:e,messages:[]})}var u=o(3),d=function(n,e){return new a(n,e)},c=function(n){return new u(d,n)};function s(n){return r(function(){var e=this,o=Array.prototype.slice.call(arguments,0),t={shim:e,method:n,args:o,ts:new Date};window._bugnoShims[this.shimId()].messages.push(t)})}a.prototype.loadFull=function(n,e,o,t,i){var a=!1,u=e.createElement("script"),d=e.getElementsByTagName("script")[0],c=d.parentNode;u.crossOrigin="",u.src=t.bugnoJsUrl,o||(u.async=!0),u.onload=u.onreadystatechange=r(function(){if(!(a||this.readyState&&"loaded"!==this.readyState&&"complete"!==this.readyState)){u.onload=u.onreadystatechange=null;try{c.removeChild(u)}catch(n){}a=!0,function(){var e;if(void 0===n._bugnoDidLoad){e=new Error("bugno.js did not load");for(var o,t,r,a,u=0;o=n._bugnoShims[u++];)for(o=o.messages||[];t=o.shift();)for(r=t.args||[],u=0;u<r.length;++u)if("function"==typeof(a=r[u])){a(e);break}}"function"==typeof i&&i(e)}()}}),c.insertBefore(u,d)},a.prototype.wrap=function(n,e,o){try{var t;if(t="function"==typeof e?e:function(){return e||{}},"function"!=typeof n)return n;if(n._isWrap)return n;if(!n._bugno_wrapped&&(n._bugno_wrapped=function(){o&&"function"==typeof o&&o.apply(this,arguments);try{return n.apply(this,arguments)}catch(o){var e=o;throw e&&("string"==typeof e&&(e=new String(e)),e._bugnoContext=t()||{},e._bugnoContext._wrappedSource=n.toString(),window._bugnoWrappedError=e),e}},n._bugno_wrapped._isWrap=!0,n.hasOwnProperty))for(var r in n)n.hasOwnProperty(r)&&(n._bugno_wrapped[r]=n[r]);return n._bugno_wrapped}catch(e){return n}};for(var l="log,debug,info,warn,warning,error,critical,global,configure,handleUncaughtException,handleUnhandledRejection,captureEvent,captureDomContentLoaded,captureLoad".split(","),p=0;p<l.length;++p)a.prototype[l[p]]=s(l[p]);n.exports={setupShim:function(n,e){if(n){var o=e.globalAlias||"Bugno";if("object"==typeof n[o])return n[o];n._bugnoShims={},n._bugnoWrappedError=null;var i=new c(e);return r(function(){e.captureUncaught&&(i._bugnoOldOnError=n.onerror,t.captureUncaughtExceptions(n,i,!0),t.wrapGlobals(n,i,!0)),e.captureUnhandledRejections&&t.captureUnhandledRejections(n,i,!0);var r=e.autoInstrument;return!1!==e.enabled&&(void 0===r||!0===r||"object"==typeof r&&r.network)&&n.addEventListener&&(n.addEventListener("load",i.captureLoad.bind(i)),n.addEventListener("DOMContentLoaded",i.captureDomContentLoaded.bind(i))),n[o]=i,i})()}},Bugno:c}},function(n,e){function o(n,e,o,t){n._bugnoWrappedError&&(t[4]||(t[4]=n._bugnoWrappedError),t[5]||(t[5]=n._bugnoWrappedError._bugnoContext),n._bugnoWrappedError=null),e.handleUncaughtException.apply(e,t),o&&o.apply(n,t)}function t(n,e,o){if(e.hasOwnProperty&&e.hasOwnProperty("addEventListener")){for(var t=e.addEventListener;t._bugnoOldAdd&&t.belongsToShim;)t=t._bugnoOldAdd;var r=function(e,o,r){t.call(this,e,n.wrap(o),r)};r._bugnoOldAdd=t,r.belongsToShim=o,e.addEventListener=r;for(var i=e.removeEventListener;i._bugnoOldRemove&&i.belongsToShim;)i=i._bugnoOldRemove;var a=function(n,e,o){i.call(this,n,e&&e._bugno_wrapped||e,o)};a._bugnoOldRemove=i,a.belongsToShim=o,e.removeEventListener=a}}n.exports={captureUncaughtExceptions:function(n,e,t){if(n){var r;if("function"==typeof e._bugnoOldOnError)r=e._bugnoOldOnError;else if(n.onerror){for(r=n.onerror;r._bugnoOldOnError;)r=r._bugnoOldOnError;e._bugnoOldOnError=r}var i=function(){var t=Array.prototype.slice.call(arguments,0);o(n,e,r,t)};t&&(i._bugnoOldOnError=r),n.onerror=i}},captureUnhandledRejections:function(n,e,o){if(n){"function"==typeof n._bugnoURH&&n._bugnoURH.belongsToShim&&n.removeEventListener("unhandledrejection",n._bugnoURH);var t=function(n){var o,t,r;try{o=n.reason}catch(n){o=void 0}try{t=n.promise}catch(n){t="[unhandledrejection] error getting `promise` from event"}try{r=n.detail,!o&&r&&(o=r.reason,t=r.promise)}catch(n){}o||(o="[unhandledrejection] error getting `reason` from event"),e&&e.handleUnhandledRejection&&e.handleUnhandledRejection(o,t)};t.belongsToShim=o,n._bugnoURH=t,n.addEventListener("unhandledrejection",t)}},wrapGlobals:function(n,e,o){if(n){var r,i,a="EventTarget,Window,Node,ApplicationCache,AudioTrackList,ChannelMergerNode,CryptoOperation,EventSource,FileReader,HTMLUnknownElement,IDBDatabase,IDBRequest,IDBTransaction,KeyOperation,MediaController,MessagePort,ModalWindow,Notification,SVGElementInstance,Screen,TextTrack,TextTrackCue,TextTrackList,WebSocket,WebSocketWorker,Worker,XMLHttpRequest,XMLHttpRequestEventTarget,XMLHttpRequestUpload".split(",");for(r=0;r<a.length;++r)n[i=a[r]]&&n[i].prototype&&t(e,n[i].prototype,o)}}}},function(n,e){function o(n,e){this.impl=n(e,this),this.options=e,function(n){for(var e=function(n){return function(){var e=Array.prototype.slice.call(arguments,0);if(this.impl[n])return this.impl[n].apply(this.impl,e)}},o="log,debug,info,warn,warning,error,critical,global,configure,handleUncaughtException,handleUnhandledRejection,_createItem,wrap,loadFull,shimId,captureEvent,captureDomContentLoaded,captureLoad".split(","),t=0;t<o.length;t++)n[o[t]]=e(o[t])}(o.prototype)}o.prototype._swapAndProcessMessages=function(n,e){var o,t,r;for(this.impl=n(this.options);o=e.shift();)t=o.method,r=o.args,this[t]&&"function"==typeof this[t]&&("captureDomContentLoaded"===t||"captureLoad"===t?this[t].apply(this,[r[0],o.ts]):this[t].apply(this,r));return this},n.exports=o},function(n,e){n.exports=function(n){return function(e){if(!e&&!window._bugnoInitialized){for(var o,t,r=(n=n||{}).globalAlias||"Bugno",i=window.bugno,a=function(n){return new i(n)},u=0;o=window._bugnoShims[u++];)t||(t=o.handler),o.handler._swapAndProcessMessages(a,o.messages);window[r]=t,window._bugnoInitialized=!0}}}}]);