var bugno = require('../bugno');

var options = (typeof window !== 'undefined') && window._bugnoConfig;
var alias = options && options.globalAlias || 'Bugno';
var shimRunning = (typeof window !== 'undefined') && window[alias] && typeof window[alias].shimId === 'function' && window[alias].shimId() !== undefined;

if ((typeof window !== 'undefined') && !window._bugnoStartTime) {
  window._bugnoStartTime = (new Date()).getTime();
}

if (!shimRunning && options) {
  var Bugno = new bugno(options);
  window[alias] = Bugno;
} else if (typeof window !== 'undefined') {
  window.bugno = bugno;
  window._bugnoDidLoad = true;
} else if (typeof self !== 'undefined') {
  self.bugno = bugno;
  self._bugnoDidLoad = true;
}

module.exports = bugno;
