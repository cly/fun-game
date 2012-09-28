var _ = require('underscore')
  , util = require('util')
  , BaseService = require('core/service/BaseService')
  , GameLocalService = require('game/service/GameLocalService')
;

// Constants
//----------------------------------------------------------------------------------------------------------------------
var _namespace = 'games';

// Constructor
//----------------------------------------------------------------------------------------------------------------------
var Module = function () {
    BaseService.call(this, _namespace);
};
util.inherits(Module, BaseService);

// Prototype
//----------------------------------------------------------------------------------------------------------------------
Module.prototype.attachRoutes = function () {
    BaseService.prototype.attachRoutes.call(this);
};

Module.prototype.show = function (req, res, next) {
    var self = this;
    var id = '' + req.params.id;
    return res.send('hi');
};

var instance = new Module();
module.exports = instance;
