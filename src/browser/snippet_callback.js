module.exports = function(options) {
  return function(err) {
    if (err) {
      return;
    }

    if (!window._bugnoInitialized) {
      options = options || {};
      var alias = options.globalAlias || 'Bugno';

      var bugno = window.bugno;
      var realImpl = function(o) {
        return new bugno(o);
      };
      var i = 0, obj, mainHandler;
      while ((obj = window._bugnoShims[i++])) {
        if (!mainHandler) {
          mainHandler = obj.handler;
        }
        obj.handler._swapAndProcessMessages(realImpl, obj.messages);
      }

      window[alias] = mainHandler;
      window._bugnoInitialized = true;
    }
  };
};
