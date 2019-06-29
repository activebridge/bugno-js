/* global __DEFAULT_BUGNOJS_URL__:false */
/* global _bugnoConfig:true */

var Shim = require('../shim');
var snippetCallback = require('../snippet_callback');

_bugnoConfig = _bugnoConfig || {};
_bugnoConfig.bugnoJsUrl = _bugnoConfig.bugnoJsUrl || __DEFAULT_BUGNOJS_URL__;
_bugnoConfig.async = _bugnoConfig.async === undefined || _bugnoConfig.async;

var shim = Shim.setupShim(window, _bugnoConfig);
var callback = snippetCallback(_bugnoConfig);
window.bugno = Shim.Bugno;

shim.loadFull(window, document, !_bugnoConfig.async, _bugnoConfig, callback);
