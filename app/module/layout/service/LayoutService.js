var _ = require('underscore')
  , util = require('util')
  , app = require('')
  , config = app.getConfig()
  , BaseService = require('core/service/BaseService')
  , LayoutLocalService = require('layout/service/LayoutLocalService')
;

// Constants
//----------------------------------------------------------------------------------------------------------------------
var _namespace = '';

// Constructor
//----------------------------------------------------------------------------------------------------------------------
var Module = function () {
    BaseService.call(this, _namespace);
};
util.inherits(Module, BaseService);

// Prototype
//----------------------------------------------------------------------------------------------------------------------
Module.prototype.attachRoutes = function () {
    // HTML Routes.
    this.server.get('/', _(this.layout).bind(this));
    this.server.get('/:ownerId', _(this.layout).bind(this));
    this.server.get(config.getApiUrl('misc/routes'), _(this.readListRoutes).bind(this));
};

Module.prototype.layout = function (req, res, next) {
    return res.send(LayoutLocalService.toHTML(req));
};

Module.prototype.readListRoutes = function (req, res, next) {
    return res.json(RouterLocalService.toJSON());
};

var instance = new Module();
module.exports = instance;

var RouterLocalService = require('core/service/RouterLocalService')
;
