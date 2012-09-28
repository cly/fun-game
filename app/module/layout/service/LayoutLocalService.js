var _ = require('underscore')
  , path = require('path')
  , util = require('util')
  , app = require('')
  , config = app.getConfig()
  , BasicUser = require('user/model/BasicUser')
  , BaseTemplateLocalService = require('core/service/BaseTemplateLocalService')
  , DeployLocalService = require('core/service/DeployLocalService')
  , Betable = require('betable-oauth-node-sdk')
;

// Private
//----------------------------------------------------------------------------------------------------------------------
var _templateFileName = path.join(__dirname, '../template/layout.html');
var BETABLE_USER_FIELDS = ['account', 'wallet'];
var _betableSDKs = {};

// Constructor
//----------------------------------------------------------------------------------------------------------------------
var Module = function () {
    BaseTemplateLocalService.call(this, _templateFileName);
};
util.inherits(Module, BaseTemplateLocalService);

// Prototype
//----------------------------------------------------------------------------------------------------------------------
Module.prototype.getBetableSDK = function (gameName) {
    if (_betableSDKs[gameName]) {
        return _betableSDKs[gameName];
    } else {
        var games = config.getBetableOAUTHSettings();
        var game = games[gameName];
        if (game) {
            var sdk = new Betable(game);
            _betableSDKs[gameName] = sdk;
            return sdk;
        } else {
            return null;
        }
    }
};

Module.prototype.hasBetableSDK = function (gameName) {
    var sdk = this.getBetableSDK(gameName);
    if (sdk) {
        return true;
    } else {
        return false;
    }
};

Module.prototype.getLayout = function (req, cb) {
    var self = this;
    if (!req.session || !req.session.accessToken) {
        return cb('no betable access token');
    }
    Betable.get(BETABLE_USER_FIELDS, req.session.accessToken, function (e, betableUser) {
        if (e) {
            return cb(e);
        } else {
            var clientSession = self.toClientSession(betableUser, req.session.accessToken);

            var params = {
                config: config
              , clientJSFileNames: DeployLocalService.getClientJSFileNames()
              , clientSession: JSON.stringify(clientSession)
            };
            return cb(null, self.renderTemplate(params));
        }
    });
};

Module.prototype.toClientSession = function (betableUser, betableAccessToken) {
    var betable = {};
    betable.user = betableUser;
    betable.accessToken = betableAccessToken;
    betable.gameId = config.getBetableGameId();
    return {
        betable: betable
    };
};

var instance = new Module();
module.exports = instance;
