var _ = require('./utility');
var helpers = require('./apiUtility');
var truncation = require('./truncation');

function initdefaultOptions(accessToken) {
  var path = '/api/v1/projects/' + accessToken + '/events';
  return({
    hostname: 'api.bugno.io',
    path: path,
    search: null,
    version: '1',
    protocol: 'https:',
    port: 443
  });
}

/**
 * Api is an object that encapsulates methods of communicating with
 * the Bugno API.  It is a standard interface with some parts implemented
 * differently for server or browser contexts.  It is an object that should
 * be instantiated when used so it can contain non-global options that may
 * be different for another instance of BugnoApi.
 *
 * @param options {
 *    accessToken: the accessToken to use for posting items to bugno
 *    endpoint: an alternative endpoint to send errors to
 *        must be a valid, fully qualified URL.
 *        The default is: https://api.bugno.com/api/1/item
 *    proxy: if you wish to proxy requests provide an object
 *        with the following keys:
 *          host or hostname (required): foo.example.com
 *          port (optional): 123
 *          protocol (optional): https
 * }
 */
function Api(options, t, u, j) {
  this.options = options;
  this.transport = t;
  this.url = u;
  this.jsonBackup = j;
  this.accessToken = options.accessToken;
  this.transportOptions = _getTransport(options, u);
}

/**
 *
 * @param data
 * @param callback
 */

function formatPayloadData(data) {
var payload
if (data.framework == 'browser-js') {
  payload = {
    title: data.body.trace.exception.class,
    message: data.body.trace.exception.message,
    framework: data.framework,
    backtrace: data.body.trace.frames,
    person_data: data.client,
    params: data.request,
    client: data.client.timestamp,
    headers: { 'User-Agent': data.client.javascript.browser }
 }
} else if (data.framework == 'node-js') {
  payload = {
    title: data.body.trace_chain[0].exception.class,
    message: data.body.trace_chain[0].exception.message,
    server_data: {
      host: data.server.host,
      root: data.server.root
    },
    framework: data.framework,
    backtrace: data.body.trace_chain[0].frames,
    ip_address: data.request.ip_address,
    url: data.request.url,
    http_method: data.request.method,
    params: data.request.GET || data.request.POST,
    headers: data.request.headers
  }
}
 return payload;
}

Api.prototype.postItem = function(data, callback) {
  var transportOptions = helpers.transportOptions(this.transportOptions, 'POST');
  var payload = formatPayloadData(data);
  this.transport.post(this.accessToken, transportOptions, payload, callback);
};

/**
 *
 * @param data
 * @param callback
 */
Api.prototype.buildJsonPayload = function(data, callback) {
  var payload = helpers.buildPayload(this.accessToken, data, this.jsonBackup);

  var stringifyResult = truncation.truncate(payload);
  if (stringifyResult.error) {
    if (callback) {
      callback(stringifyResult.error);
    }
    return null;
  }

  return stringifyResult.value;
};

/**
 *
 * @param jsonPayload
 * @param callback
 */
Api.prototype.postJsonPayload = function(jsonPayload, callback) {
  var transportOptions = helpers.transportOptions(this.transportOptions, 'POST');
  this.transport.postJsonPayload(this.accessToken, transportOptions, jsonPayload, callback);
};

Api.prototype.configure = function(options) {
  var oldOptions = this.oldOptions;
  this.options = _.merge(oldOptions, options);
  this.transportOptions = _getTransport(this.options, this.url);
  if (this.options.accessToken !== undefined) {
    this.accessToken = this.options.accessToken;
  }
  return this;
};

function _getTransport(options, url) {
  return helpers.getTransportFromOptions(options, initdefaultOptions(options.accessToken), url);
}

module.exports = Api;
