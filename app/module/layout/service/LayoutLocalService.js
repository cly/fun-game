var _ = require('underscore')
  , path = require('path')
  , util = require('util')
  , app = require('')
  , config = app.getConfig()
  , BasicUser = require('user/model/BasicUser')
  , BaseTemplateLocalService = require('core/service/BaseTemplateLocalService')
  , DeployLocalService = require('core/service/DeployLocalService')
;

// Private
//----------------------------------------------------------------------------------------------------------------------
var _templateFileName = path.join(__dirname, '../template/layout.html');

// Constructor
//----------------------------------------------------------------------------------------------------------------------
var Module = function () {
    BaseTemplateLocalService.call(this, _templateFileName);
};
util.inherits(Module, BaseTemplateLocalService);

// Prototype
//----------------------------------------------------------------------------------------------------------------------

Module.prototype.toClientSession = function (session) {
    var result = {};
    result.user = {};
    if (session.user) {
        // Logged in.
        //var user = BasicUser.fromServerSessionUser(session.user);
        //
        // result.user = user.toClientSessionUser();
        result.user = session.user.toClientSessionUser();
    } else if (session.auth && session.auth.facebook && session.auth.facebook.user) {
        // Must be new user from facebook.
        var original = session.auth.facebook.user;
        result.user.isNewUser = true;
        result.user.isUsernameValid = true;
        result.user.email = original.email;
        result.user.firstName = original.first_name;
        result.user.lastName = original.last_name;
        result.user.username = original.username;
        result.user.gender = original.gender;
    }
    return result;
};

Module.prototype.toHTML = function (req) {
    var clientSession = this.toClientSession(req.session);

    var params = {
        config: config
      , clientJSFileNames: DeployLocalService.getClientJSFileNames()
      , clientSession: JSON.stringify(clientSession)
    };
    return this.template(params);
};

var instance = new Module();
module.exports = instance;
