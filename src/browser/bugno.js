var Client = require('../bugno');
var _ = require('../utility');
var API = require('../api');
var logger = require('./logger');
var globals = require('./globalSetup');

var transport = require('./transport');
var urllib = require('./url');

var transforms = require('./transforms');
var sharedTransforms = require('../transforms');
var predicates = require('./predicates');
var sharedPredicates = require('../predicates');
var errorParser = require('./errorParser');
var Instrumenter = require('./telemetry');

function Bugno(options, client) {
  this.options = _.handleOptions(initdefaultOptions(options.accessToken), options);
  var api = new API(this.options, transport, urllib);
  this.client = client || new Client(this.options, api, logger, 'browser');
  var gWindow = _gWindow();
  var gDocument = (typeof document != 'undefined') && document;
  addTransformsToNotifier(this.client.notifier, gWindow);
  addPredicatesToQueue(this.client.queue);
  this.setupUnhandledCapture();
  this.instrumenter = new Instrumenter(this.options, this.client.telemeter, this, gWindow, gDocument);
  this.instrumenter.instrument();
}

var _instance = null;
Bugno.init = function(options, client) {
  if (_instance) {
    return _instance.global(options).configure(options);
  }
  _instance = new Bugno(options, client);
  return _instance;
};

function handleUninitialized(maybeCallback) {
  var message = 'Bugno is not initialized';
  logger.error(message);
  if (maybeCallback) {
    maybeCallback(new Error(message));
  }
}

Bugno.prototype.global = function(options) {
  this.client.global(options);
  return this;
};
Bugno.global = function(options) {
  if (_instance) {
    return _instance.global(options);
  } else {
    handleUninitialized();
  }
};

Bugno.prototype.configure = function(options, payloadData) {
  var oldOptions = this.options;
  var payload = {};
  if (payloadData) {
    payload = {payload: payloadData};
  }
  this.options = _.handleOptions(oldOptions, options, payload);
  this.client.configure(this.options, payloadData);
  this.instrumenter.configure(this.options);
  this.setupUnhandledCapture();
  return this;
};
Bugno.configure = function(options, payloadData) {
  if (_instance) {
    return _instance.configure(options, payloadData);
  } else {
    handleUninitialized();
  }
};

Bugno.prototype.lastError = function() {
  return this.client.lastError;
};
Bugno.lastError = function() {
  if (_instance) {
    return _instance.lastError();
  } else {
    handleUninitialized();
  }
};

Bugno.prototype.log = function() {
  var item = this._createItem(arguments);
  var uuid = item.uuid;
  this.client.log(item);
  return {uuid: uuid};
};
Bugno.log = function() {
  if (_instance) {
    return _instance.log.apply(_instance, arguments);
  } else {
    var maybeCallback = _getFirstFunction(arguments);
    handleUninitialized(maybeCallback);
  }
};

Bugno.prototype.debug = function() {
  var item = this._createItem(arguments);
  var uuid = item.uuid;
  this.client.debug(item);
  return {uuid: uuid};
};
Bugno.debug = function() {
  if (_instance) {
    return _instance.debug.apply(_instance, arguments);
  } else {
    var maybeCallback = _getFirstFunction(arguments);
    handleUninitialized(maybeCallback);
  }
};

Bugno.prototype.info = function() {
  var item = this._createItem(arguments);
  var uuid = item.uuid;
  this.client.info(item);
  return {uuid: uuid};
};
Bugno.info = function() {
  if (_instance) {
    return _instance.info.apply(_instance, arguments);
  } else {
    var maybeCallback = _getFirstFunction(arguments);
    handleUninitialized(maybeCallback);
  }
};

Bugno.prototype.warn = function() {
  var item = this._createItem(arguments);
  var uuid = item.uuid;
  this.client.warn(item);
  return {uuid: uuid};
};
Bugno.warn = function() {
  if (_instance) {
    return _instance.warn.apply(_instance, arguments);
  } else {
    var maybeCallback = _getFirstFunction(arguments);
    handleUninitialized(maybeCallback);
  }
};

Bugno.prototype.warning = function() {
  var item = this._createItem(arguments);
  var uuid = item.uuid;
  this.client.warning(item);
  return {uuid: uuid};
};
Bugno.warning = function() {
  if (_instance) {
    return _instance.warning.apply(_instance, arguments);
  } else {
    var maybeCallback = _getFirstFunction(arguments);
    handleUninitialized(maybeCallback);
  }
};

Bugno.prototype.error = function() {
  var item = this._createItem(arguments);
  var uuid = item.uuid;
  this.client.error(item);
  return {uuid: uuid};
};
Bugno.error = function() {
  if (_instance) {
    return _instance.error.apply(_instance, arguments);
  } else {
    var maybeCallback = _getFirstFunction(arguments);
    handleUninitialized(maybeCallback);
  }
};

Bugno.prototype.critical = function() {
  var item = this._createItem(arguments);
  var uuid = item.uuid;
  this.client.critical(item);
  return {uuid: uuid};
};
Bugno.critical = function() {
  if (_instance) {
    return _instance.critical.apply(_instance, arguments);
  } else {
    var maybeCallback = _getFirstFunction(arguments);
    handleUninitialized(maybeCallback);
  }
};

Bugno.prototype.buildJsonPayload = function(item) {
  return this.client.buildJsonPayload(item);
};
Bugno.buildJsonPayload = function() {
  if (_instance) {
    return _instance.buildJsonPayload.apply(_instance, arguments);
  } else {
    handleUninitialized();
  }
};

Bugno.prototype.sendJsonPayload = function(jsonPayload) {
  return this.client.sendJsonPayload(jsonPayload);
};
Bugno.sendJsonPayload = function() {
  if (_instance) {
    return _instance.sendJsonPayload.apply(_instance, arguments);
  } else {
    handleUninitialized();
  }
};

Bugno.prototype.setupUnhandledCapture = function() {
  var gWindow = _gWindow();

  if (!this.unhandledExceptionsInitialized) {
    if (this.options.captureUncaught || this.options.handleUncaughtExceptions) {
      globals.captureUncaughtExceptions(gWindow, this);
      globals.wrapGlobals(gWindow, this);
      this.unhandledExceptionsInitialized = true;
    }
  }
  if (!this.unhandledRejectionsInitialized) {
    if (this.options.captureUnhandledRejections || this.options.handleUnhandledRejections) {
      globals.captureUnhandledRejections(gWindow, this);
      this.unhandledRejectionsInitialized = true;
    }
  }
};

Bugno.prototype.handleUncaughtException = function(message, url, lineno, colno, error, context) {
  if (!this.options.captureUncaught && !this.options.handleUncaughtExceptions) {
    return;
  }

  var item;
  var stackInfo = _.makeUnhandledStackInfo(
    message,
    url,
    lineno,
    colno,
    error,
    'onerror',
    'uncaught exception',
    errorParser
  );
  if (_.isError(error)) {
    item = this._createItem([message, error, context]);
    item._unhandledStackInfo = stackInfo;
  } else if (_.isError(url)) {
    item = this._createItem([message, url, context]);
    item._unhandledStackInfo = stackInfo;
  } else {
    item = this._createItem([message, context]);
    item.stackInfo = stackInfo;
  }
  item.level = this.options.uncaughtErrorLevel;
  item._isUncaught = true;
  this.client.log(item);
};

Bugno.prototype.handleUnhandledRejection = function(reason, promise) {
  if (!this.options.captureUnhandledRejections && !this.options.handleUnhandledRejections) {
    return;
  }

  var message = 'unhandled rejection was null or undefined!';
  if (reason) {
    if (reason.message) {
      message = reason.message;
    } else {
      var reasonResult = _.stringify(reason);
      if (reasonResult.value) {
        message = reasonResult.value;
      }
    }
  }
  var context = (reason && reason._bugnoContext) || (promise && promise._bugnoContext);

  var item;
  if (_.isError(reason)) {
    item = this._createItem([message, reason, context]);
  } else {
    item = this._createItem([message, reason, context]);
    item.stackInfo = _.makeUnhandledStackInfo(
      message,
      '',
      0,
      0,
      null,
      'unhandledrejection',
      '',
      errorParser
    );
  }
  item.level = this.options.uncaughtErrorLevel;
  item._isUncaught = true;
  item._originalArgs = item._originalArgs || [];
  item._originalArgs.push(promise);
  this.client.log(item);
};

Bugno.prototype.wrap = function(f, context, _before) {
  try {
    var ctxFn;
    if(_.isFunction(context)) {
      ctxFn = context;
    } else {
      ctxFn = function() { return context || {}; };
    }

    if (!_.isFunction(f)) {
      return f;
    }

    if (f._isWrap) {
      return f;
    }

    if (!f._bugno_wrapped) {
      f._bugno_wrapped = function () {
        if (_before && _.isFunction(_before)) {
          _before.apply(this, arguments);
        }
        try {
          return f.apply(this, arguments);
        } catch(exc) {
          var e = exc;
          if (e && window._bugnoWrappedError !== e) {
            if (_.isType(e, 'string')) {
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
          if (f.hasOwnProperty(prop) && prop !== '_bugno_wrapped') {
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
Bugno.wrap = function(f, context) {
  if (_instance) {
    return _instance.wrap(f, context);
  } else {
    handleUninitialized();
  }
};

Bugno.prototype.captureEvent = function() {
  var event = _.createTelemetryEvent(arguments);
  return this.client.captureEvent(event.type, event.metadata, event.level);
};
Bugno.captureEvent = function() {
  if (_instance) {
    return _instance.captureEvent.apply(_instance, arguments);
  } else {
    handleUninitialized();
  }
};

// The following two methods are used internally and are not meant for public use
Bugno.prototype.captureDomContentLoaded = function(e, ts) {
  if (!ts) {
    ts = new Date();
  }
  return this.client.captureDomContentLoaded(ts);
};

Bugno.prototype.captureLoad = function(e, ts) {
  if (!ts) {
    ts = new Date();
  }
  return this.client.captureLoad(ts);
};

/* Internal */

function addTransformsToNotifier(notifier, gWindow) {
  notifier
    .addTransform(transforms.handleItemWithError)
    .addTransform(transforms.ensureItemHasSomethingToSay)
    .addTransform(transforms.addBaseInfo)
    .addTransform(transforms.addRequestInfo(gWindow))
    .addTransform(transforms.addClientInfo(gWindow))
    .addTransform(transforms.addPluginInfo(gWindow))
    .addTransform(transforms.addBody)
    .addTransform(sharedTransforms.addMessageWithError)
    .addTransform(sharedTransforms.addTelemetryData)
    .addTransform(sharedTransforms.addConfigToPayload)
    .addTransform(transforms.scrubPayload)
    .addTransform(sharedTransforms.userTransform(logger))
    .addTransform(sharedTransforms.itemToPayload);
}

function addPredicatesToQueue(queue) {
  queue
    .addPredicate(sharedPredicates.checkLevel)
    .addPredicate(predicates.checkIgnore)
    .addPredicate(sharedPredicates.userCheckIgnore(logger))
    .addPredicate(sharedPredicates.urlIsNotBlacklisted(logger))
    .addPredicate(sharedPredicates.urlIsWhitelisted(logger))
    .addPredicate(sharedPredicates.messageIsIgnored(logger));
}

Bugno.prototype._createItem = function(args) {
  return _.createItem(args, logger, this);
};

function _getFirstFunction(args) {
  for (var i = 0, len = args.length; i < len; ++i) {
    if (_.isFunction(args[i])) {
      return args[i];
    }
  }
  return undefined;
}

function _gWindow() {
  return ((typeof window != 'undefined') && window) || ((typeof self != 'undefined') && self);
}

function initdefaultOptions(accessToken) {
  var endpoint = 'api.bugno.io/api/v1/projects/' + accessToken + '/events';
  return({
    version: '0.1.0',
    scrubFields: ['pw','pass','passwd','password','secret','confirm_password','confirmPassword','password_confirmation','passwordConfirmation','access_token','accessToken','secret_key','secretKey','secretToken','cc-number','card number','cardnumber','cardnum','ccnum','ccnumber','cc num','creditcardnumber','credit card number','newcreditcardnumber','new credit card','creditcardno','credit card no','card#','card #','cc-csc','cvc2','cvv2','ccv2','security code','card verification','name on credit card','name on card','nameoncard','cardholder','card holder','name des karteninhabers','card type','cardtype','cc type','cctype','payment type','expiration date','expirationdate','expdate','cc-exp'],
    logLevel: 'debug',
    reportLevel: 'debug',
    uncaughtErrorLevel: 'error',
    verbose: false,
    endpoint: endpoint,
    enabled: true,
    sendConfig: false,
    includeItemsInTelemetry: true,
    captureIp: true
  });
}

module.exports = Bugno;
