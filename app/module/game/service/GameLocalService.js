var _ = require('underscore')
  , path = require('path')
  , util = require('util')
  , async = require('async')
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
Module.prototype.getBetableConfig = function (gameName) {
    var games = config.getBetableOAUTHSettings();
    var game = games[gameName];
    return game;
};

Module.prototype.getBetableSDK = function (gameName) {
    if (_betableSDKs[gameName]) {
        return _betableSDKs[gameName];
    } else {
        var game = this.getBetableConfig(gameName);
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

Module.prototype.getLayout = function (pdCooperateAccessToken, pdBetrayAccessToken, cb) {
    var self = this;
    if (!pdCooperateAccessToken || !pdBetrayAccessToken) {
        return cb('not enough betable access tokens');
    }
    if (this.hasBetableSDK('pdCooperate') && this.hasBetableSDK('pdBetray')) {
        async.parallel(
            {
                cooperate: function (cb) {
                    self.getBetableSDK('pdCooperate').get(BETABLE_USER_FIELDS, pdCooperateAccessToken, cb);
                }
              , betray: function (cb) {
                    self.getBetableSDK('pdBetray').get(BETABLE_USER_FIELDS, pdBetrayAccessToken, cb);
                }
            }
          , function (e, d) {
                if (e) {
                    return cb('error');
                } else {
                    var betable = {};
                    betable.betray = {};
                    betable.betray.user = d.betray;
                    betable.betray.accessToken = pdBetrayAccessToken;
                    betable.betray.name = self.getBetableConfig('pdBetray').name;
                    betable.betray.gameId = self.getBetableConfig('pdBetray').id;

                    betable.cooperate = {};
                    betable.cooperate.user = d.cooperate;
                    betable.cooperate.accessToken = pdCooperateAccessToken;
                    betable.cooperate.name = self.getBetableConfig('pdCooperate').name;
                    betable.cooperate.gameId = self.getBetableConfig('pdCooperate').id;
                    
                    var params = {
                        config: config
                      , clientJSFileNames: DeployLocalService.getClientJSFileNames()
                      , clientSession: JSON.stringify({betable: betable})
                    };
                    return cb(null, self.renderTemplate(params));
                }
            }
        );
    }
};

var instance = new Module();
module.exports = instance;
