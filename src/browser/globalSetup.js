function captureUncaughtExceptions(window, handler, shim) {
  if (!window) { return; }
  var oldOnError;

  if (typeof handler._bugnoOldOnError === 'function') {
    oldOnError = handler._bugnoOldOnError;
  } else if (window.onerror) {
    oldOnError = window.onerror;
    while (oldOnError._bugnoOldOnError) {
      oldOnError = oldOnError._bugnoOldOnError;
    }
    handler._bugnoOldOnError = oldOnError;
  }

  var fn = function() {
    var args = Array.prototype.slice.call(arguments, 0);
    _bugnoWindowOnError(window, handler, oldOnError, args);
  };
  if (shim) {
    fn._bugnoOldOnError = oldOnError;
  }
  window.onerror = fn;
}

function _bugnoWindowOnError(window, r, old, args) {
  if (window._bugnoWrappedError) {
    if (!args[4]) {
      args[4] = window._bugnoWrappedError;
    }
    if (!args[5]) {
      args[5] = window._bugnoWrappedError._bugnoContext;
    }
    window._bugnoWrappedError = null;
  }

  r.handleUncaughtException.apply(r, args);
  if (old) {
    old.apply(window, args);
  }
}

function captureUnhandledRejections(window, handler, shim) {
  if (!window) { return; }

  if (typeof window._bugnoURH === 'function' && window._bugnoURH.belongsToShim) {
    window.removeEventListener('unhandledrejection', window._bugnoURH);
  }

  var rejectionHandler = function (evt) {
    var reason, promise, detail;
    try {
      reason = evt.reason;
    } catch (e) {
      reason = undefined;
    }
    try {
      promise = evt.promise;
    } catch (e) {
      promise = '[unhandledrejection] error getting `promise` from event';
    }
    try {
      detail = evt.detail;
      if (!reason && detail) {
        reason = detail.reason;
        promise = detail.promise;
      }
    } catch (e) {
      // Ignore
    }
    if (!reason) {
      reason = '[unhandledrejection] error getting `reason` from event';
    }

    if (handler && handler.handleUnhandledRejection) {
      handler.handleUnhandledRejection(reason, promise);
    }
  };
  rejectionHandler.belongsToShim = shim;
  window._bugnoURH = rejectionHandler;
  window.addEventListener('unhandledrejection', rejectionHandler);
}

function wrapGlobals(window, handler, shim) {
  if (!window) { return; }
  // Adapted from https://github.com/bugsnag/bugsnag-js
  var globals = 'EventTarget,Window,Node,ApplicationCache,AudioTrackList,ChannelMergerNode,CryptoOperation,EventSource,FileReader,HTMLUnknownElement,IDBDatabase,IDBRequest,IDBTransaction,KeyOperation,MediaController,MessagePort,ModalWindow,Notification,SVGElementInstance,Screen,TextTrack,TextTrackCue,TextTrackList,WebSocket,WebSocketWorker,Worker,XMLHttpRequest,XMLHttpRequestEventTarget,XMLHttpRequestUpload'.split(',');
  var i, global;
  for (i = 0; i < globals.length; ++i) {
    global = globals[i];

    if (window[global] && window[global].prototype) {
      _extendListenerPrototype(handler, window[global].prototype, shim);
    }
  }
}

function _extendListenerPrototype(handler, prototype, shim) {
  if (prototype.hasOwnProperty && prototype.hasOwnProperty('addEventListener')) {
    var oldAddEventListener = prototype.addEventListener;
    while (oldAddEventListener._bugnoOldAdd && oldAddEventListener.belongsToShim) {
      oldAddEventListener = oldAddEventListener._bugnoOldAdd;
    }
    var addFn = function(event, callback, bubble) {
      oldAddEventListener.call(this, event, handler.wrap(callback), bubble);
    };
    addFn._bugnoOldAdd = oldAddEventListener;
    addFn.belongsToShim = shim;
    prototype.addEventListener = addFn;

    var oldRemoveEventListener = prototype.removeEventListener;
    while (oldRemoveEventListener._bugnoOldRemove && oldRemoveEventListener.belongsToShim) {
      oldRemoveEventListener = oldRemoveEventListener._bugnoOldRemove;
    }
    var removeFn = function(event, callback, bubble) {
      oldRemoveEventListener.call(this, event, callback && callback._bugno_wrapped || callback, bubble);
    };
    removeFn._bugnoOldRemove = oldRemoveEventListener;
    removeFn.belongsToShim = shim;
    prototype.removeEventListener = removeFn;
  }
}

module.exports = {
  captureUncaughtExceptions: captureUncaughtExceptions,
  captureUnhandledRejections: captureUnhandledRejections,
  wrapGlobals: wrapGlobals
};
