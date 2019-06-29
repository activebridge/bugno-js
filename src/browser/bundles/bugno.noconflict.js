var bugno = require('../bugno');

if ((typeof window !== 'undefined') && !window._bugnoStartTime) {
  window._bugnoStartTime = (new Date()).getTime();
}

module.exports = bugno;
