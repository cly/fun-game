var _ = require('underscore')
  , util = require('util')
  , app = require('')
  , config = app.getConfig()
  , BaseService = require('core/service/BaseService')
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
    this.server.get('/game/:id', _(this.layout).bind(this));
    this.server.get(config.getApiUrl('misc/routes'), _(this.readListRoutes).bind(this));
    this.server.get(config.getApiUrl(config.getBetableOAUTHRedirectPath()), _(this.betableOAUTHCallback).bind(this));
};

//https://github.com/betable/betable-node-sample/blob/master/server.js
Module.prototype.betableOAUTHCallback = function (req, res, next) {
    var code = req.query.code
      , state = req.query.state
    ;

    if (!state || (state != req.session.pdCooperateState && state != req.session.pdBetrayState)) {
        delete req.session.pdCooperateState;
        delete req.session.pdBetrayState;
        return res.send({error: 'bad state'}, 400);
    }

    if (req.query.error) {
        return res.send('we got an error', req.query.error)
    }

    // Handle both potential game oauth states.
    if (req.session.pdCooperateState) {
        delete req.session.pdCooperateState;
        if (GameLocalService.hasBetableSDK('pdCooperate')) {
            GameLocalService.getBetableSDK('pdCooperate').token(code, function (e, accessToken) {
                if (e) {
                    return res.send({error: e}, 400);
                }

                req.session.pdCooperateAccessToken = accessToken;
                return res.redirect(config.getHostName());
            });
        } else {
            return res.send('we could not find sdk', req.query.error)
        }
    } else if (req.session.pdBetrayState) {
        delete req.session.pdBetrayState;
        if (GameLocalService.hasBetableSDK('pdBetray')) {
            GameLocalService.getBetableSDK('pdBetray').token(code, function (e, accessToken) {
                if (e) {
                    return res.send({error: e}, 400);
                }

                req.session.pdBetrayAccessToken = accessToken;
                return res.redirect(config.getHostName());
            });
        } else {
            return res.send('we could not find sdk', req.query.error)
        }
    }
};

Module.prototype.layout = function (req, res, next) {
    // Ugly but gets two tokens.
    if (!req.session.pdCooperateAccessToken) {
        // Go to oauth flow.
        req.session.pdCooperateState = Math.floor(Math.random() * 1100000000000).toString();
        return GameLocalService.getBetableSDK('pdCooperate').authorize(res, req.session.pdCooperateState);
    } else if (!req.session.pdBetrayAccessToken) {
        // Go to oauth flow.
        req.session.pdBetrayState = Math.floor(Math.random() * 1100000000000).toString();
        return GameLocalService.getBetableSDK('pdBetray').authorize(res, req.session.pdBetrayState);
    } else {
        // Have oauth tokens!
        GameLocalService.getLayout(req.session.pdCooperateAccessToken, req.session.pdBetrayAccessToken, function (e, d) {
            if (e) {
                return res.send({error: e}, 400);
            } else {
                return res.send(d);
            }
        });
    }
};

Module.prototype.readListRoutes = function (req, res, next) {
    return res.json(RouterLocalService.toJSON());
};

var instance = new Module();
module.exports = instance;

var GameLocalService = require('game/service/GameLocalService')
  , RouterLocalService = require('core/service/RouterLocalService')
;
