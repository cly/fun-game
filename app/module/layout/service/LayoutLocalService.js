var _ = require('underscore')
  , path = require('path')
  , util = require('util')
  , app = require('')
  , config = app.getConfig()
  , BasicUser = require('user/model/BasicUser')
  , BaseTemplateLocalService = require('core/service/BaseTemplateLocalService')
  , DeployLocalService = require('core/service/DeployLocalService')
  , Betable = require('betable-oauth-node-sdk')(config.getBetableOAUTHSettings())
;

// Private
//----------------------------------------------------------------------------------------------------------------------
var _templateFileName = path.join(__dirname, '../template/layout.html');
var BETABLE_USER_FIELDS = ['account', 'wallet'];

// Constructor
//----------------------------------------------------------------------------------------------------------------------
var Module = function () {
    BaseTemplateLocalService.call(this, _templateFileName);
};
util.inherits(Module, BaseTemplateLocalService);

// Prototype
//----------------------------------------------------------------------------------------------------------------------
Module.prototype.getLayout = function (req, cb) {
    var self = this;
    Betable.get(BETABLE_USER_FIELDS, req.session.accessToken, function (e, d) {
        if (e) {
            return cb(e);
        } else {
            var clientSession = self.toClientSession(d);

            var params = {
                config: config
              , clientJSFileNames: DeployLocalService.getClientJSFileNames()
              , clientSession: JSON.stringify(clientSession)
            };
            return cb(null, self.template(params));
        }
    });
};

Module.prototype.toClientSession = function (betableUser) {
    var result = {};
    result.betableUser = betableUser;
    return result;
};

Module.prototype.toHTML = function (req) {
    var clientSession = this.toClientSession(req.session);

    var params = {
        config: config
      , clientJSFileNames: DeployLocalService.getClientJSFileNames()
      , clientSession: {}
    };
    return this.template(params);
};

var instance = new Module();
module.exports = instance;
