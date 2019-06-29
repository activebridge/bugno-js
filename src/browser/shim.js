var globals = require('./globalSetup');

function _wrapInternalErr(f) {
  return function() {
    try {
      return f.apply(this, arguments);
    } catch (e) {
      try {
        /* eslint-disable no-console */
        console.error('[Bugno]: Internal error', e);
        /* eslint-enable no-console */
      } catch (e2) {
        // Ignore
      }
    }
  };
}

var _shimIdCounter = 0;
function Shim(options, wrap) {
  this.options = options;
  this._bugnoOldOnError = null;
  var shimId = _shimIdCounter++;
  this.shimId = function() { return shimId; };
  if ((typeof window !== 'undefined') && window._bugnoShims) {
    window._bugnoShims[shimId] = {handler: wrap, messages: []};
  }
}

var Wrapper = require('./bugnoWrapper');
var ShimImpl = function(options, wrap) {
  return new Shim(options, wrap);
};
var Bugno = function(options) {
  return new Wrapper(ShimImpl, options);
};

function setupShim(window, options) {
  if (!window) {
    return;
  }
  var alias = options.globalAlias || 'Bugno';
  if (typeof window[alias] === 'object') {
    return window[alias];
  }

  window._bugnoShims = {};
  window._bugnoWrappedError = null;

  var handler = new Bugno(options);
  return _wrapInternalErr(function() {
    if (options.captureUncaught) {
      handler._bugnoOldOnError = window.onerror;
      globals.captureUncaughtExceptions(window, handler, true);
      globals.wrapGlobals(window, handler, true);
    }

    if (options.captureUnhandledRejections) {
      globals.captureUnhandledRejections(window, handler, true);
    }

    var ai = options.autoInstrument;
    if (options.enabled !== false) {
      if (ai === undefined || ai === true || (typeof ai === 'object' && ai.network)) {
        if (window.addEventListener) {
          window.addEventListener('load', handler.captureLoad.bind(handler));
          window.addEventListener('DOMContentLoaded', handler.captureDomContentLoaded.bind(handler));
        }
      }
    }

    window[alias] = handler;
    return handler;
  })();
}

Shim.prototype.loadFull = function(window, document, immediate, options, callback) {
  var onload = function () {
    var err;
    if (window._bugnoDidLoad === undefined) {
      err = new Error('bugno.js did not load');
      var i=0, queue, obj, args, cb;
      while ((queue = window._bugnoShims[i++])) {
        queue = queue.messages || [];
        while ((obj = queue.shift())) {
          args = obj.args || [];
          for (i = 0; i < args.length; ++i) {
            cb = args[i];
            if (typeof cb === 'function') {
              cb(err);
              break;
            }
          }
        }
      }
    }
    if (typeof callback === 'function') {
      callback(err);
    }
  };

  // Load the full bugno.js source
  var done = false;
  var s = document.createElement('script');
  var f = document.getElementsByTagName('script')[0];
  var parentNode = f.parentNode;

  s.crossOrigin = '';
  s.src = options.bugnoJsUrl;
  if (!immediate) {
    s.async = true;
  }

  s.onload = s.onreadystatechange = _wrapInternalErr(function() {
    if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
      s.onload = s.onreadystatechange = null;
      try {
        parentNode.removeChild(s);
      } catch (e) {
        // pass
      }
      done = true;

      onload();
    }
  });
  parentNode.insertBefore(s, f);
};

Shim.prototype.wrap = function(f, context, _before) {
  try {
    var ctxFn;
    if (typeof context === 'function') {
      ctxFn = context;
    } else {
      ctxFn = function() { return context || {}; };
    }

    if (typeof f !== 'function') {
      return f;
    }

    if (f._isWrap) {
      return f;
    }

    if (!f._bugno_wrapped) {
      f._bugno_wrapped = function () {
        if (_before && typeof _before === 'function') {
          _before.apply(this, arguments);
        }
        try {
          return f.apply(this, arguments);
        } catch(exc) {
          var e = exc;
          if (e) {
            if (typeof e === 'string') {
              e = new String(e);
            }
            e._bugnoContext = ctxFn() || {};
            e._bugnoContext._wrappedSource = f.toString();

            window._bugnoWrappedError = e;
          }
          throw e;
        }
      };

      f._bugno_wrapped._isWrap = true;

      if (f.hasOwnProperty) {
        for (var prop in f) {
          if (f.hasOwnProperty(prop)) {
            f._bugno_wrapped[prop] = f[prop];
          }
        }
      }
    }

    return f._bugno_wrapped;
  } catch (e) {
    // Return the original function if the wrap fails.
    return f;
  }
};

function stub(method) {
  return _wrapInternalErr(function() {
    var shim = this;
    var args = Array.prototype.slice.call(arguments, 0);
    var data = {shim: shim, method: method, args: args, ts: new Date()};
    window._bugnoShims[this.shimId()].messages.push(data);
  });
}

var _methods =
  'log,debug,info,warn,warning,error,critical,global,configure,handleUncaughtException,handleUnhandledRejection,captureEvent,captureDomContentLoaded,captureLoad'.split(',');

for (var i = 0; i < _methods.length; ++i) {
  Shim.prototype[_methods[i]] = stub(_methods[i]);
}

module.exports = {
  setupShim: setupShim,
  Bugno: Bugno
};
