var RateLimiter = require('./rateLimiter');
var Queue = require('./queue');
var Notifier = require('./notifier');
var Telemeter = require('./telemetry');
var _ = require('./utility');

/*
 * Bugno - the interface to Bugno
 *
 * @param options
 * @param api
 * @param logger
 */
function Bugno(options, api, logger, platform) {
  this.options = _.merge(options);
  this.logger = logger;
  Bugno.rateLimiter.configureGlobal(this.options);
  Bugno.rateLimiter.setPlatformOptions(platform, this.options);
  this.api = api;
  this.queue = new Queue(Bugno.rateLimiter, api, logger, this.options);
  this.notifier = new Notifier(this.queue, this.options);
  this.telemeter = new Telemeter(this.options);
  this.lastError = null;
  this.lastErrorHash = 'none';
}

var defaultOptions = {
  maxItems: 0,
  itemsPerMinute: 60
};

Bugno.rateLimiter = new RateLimiter(defaultOptions);

Bugno.prototype.global = function(options) {
  Bugno.rateLimiter.configureGlobal(options);
  return this;
};

Bugno.prototype.configure = function(options, payloadData) {
  var oldOptions = this.options;
  var payload = {};
  if (payloadData) {
    payload = {payload: payloadData};
  }
  this.options = _.merge(oldOptions, options, payload);
  this.notifier && this.notifier.configure(this.options);
  this.telemeter && this.telemeter.configure(this.options);
  this.global(this.options);
  return this;
};

Bugno.prototype.log = function(item) {
  var level = this._defaultLogLevel();
  return this._log(level, item);
};

Bugno.prototype.debug = function(item) {
  this._log('debug', item);
};

Bugno.prototype.info = function(item) {
  this._log('info', item);
};

Bugno.prototype.warn = function(item) {
  this._log('warning', item);
};

Bugno.prototype.warning = function(item) {
  this._log('warning', item);
};

Bugno.prototype.error = function(item) {
  this._log('error', item);
};

Bugno.prototype.critical = function(item) {
  this._log('critical', item);
};

Bugno.prototype.wait = function(callback) {
  this.queue.wait(callback);
};

Bugno.prototype.captureEvent = function(type, metadata, level) {
  return this.telemeter.captureEvent(type, metadata, level);
};

Bugno.prototype.captureDomContentLoaded = function(ts) {
  return this.telemeter.captureDomContentLoaded(ts);
};

Bugno.prototype.captureLoad = function(ts) {
  return this.telemeter.captureLoad(ts);
};

Bugno.prototype.buildJsonPayload = function(item) {
  return this.api.buildJsonPayload(item);
};

Bugno.prototype.sendJsonPayload = function(jsonPayload) {
  this.api.postJsonPayload(jsonPayload);
};

/* Internal */

Bugno.prototype._log = function(defaultLevel, item) {
  var callback;
  if (item.callback) {
    callback = item.callback;
    delete item.callback;
  }
  if (this._sameAsLastError(item)) {
    if (callback) {
      var error = new Error('ignored identical item');
      error.item = item;
      callback(error);
    }
    return;
  }
  try {
    item.level = item.level || defaultLevel;
    this.telemeter._captureBugnoItem(item);
    item.telemetryEvents = this.telemeter.copyEvents();
    this.notifier.log(item, callback);
  } catch (e) {
    this.logger.error(e);
  }
};

Bugno.prototype._defaultLogLevel = function() {
  return this.options.logLevel || 'debug';
};

Bugno.prototype._sameAsLastError = function(item) {
  if (!item._isUncaught) {
    return false;
  }
  var itemHash = generateItemHash(item);
  if (this.lastErrorHash === itemHash) {
    return true;
  }
  this.lastError = item.err;
  this.lastErrorHash = itemHash;
  return false;
};

function generateItemHash(item) {
  var message = item.message || '';
  var stack = (item.err || {}).stack || String(item.err);
  return message + '::' + stack;
}

module.exports = Bugno;
