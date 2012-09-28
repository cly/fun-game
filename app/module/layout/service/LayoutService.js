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

    if (req.session.pdCooperateState) {
        delete req.session.pdCooperateState;
        if (LayoutLocalService.hasBetableSDK('pdCooperate')) {
            LayoutLocalService.getBetableSDK('pdCooperate').token(code, function (e, accessToken) {
                if (e) {
                    return res.send({error: e}, 400);
                }

                req.session.pdCooperateAccessToken = accessToken;
                return res.redirect(config.getHostName());
            });
        }
    } else if (req.session.pdBetrayState) {
        delete req.session.pdBetrayState;
        if (LayoutLocalService.hasBetableSDK('pdBetray')) {
            LayoutLocalService.getBetableSDK('pdBetray').token(code, function (e, accessToken) {
                if (e) {
                    return res.send({error: e}, 400);
                }

                req.session.pdBetrayAccessToken = accessToken;
                return res.redirect(config.getHostName());
            });
        }
    }
    return res.send('we could not find sdk', req.query.error)
};

Module.prototype.layout = function (req, res, next) {
    // TODO: This should be an attribute of an user object.
    if (!req.session.pdCooperateAccessToken) {
        // Go to oauth flow.
        req.session.pdCooperateState = Math.floor(Math.random() * 1100000000000).toString();
        return LayoutLocalService.getBetableSDK('pdCooperate').authorize(res, req.session.pdCooperateState);
    } else if (!req.session.pdBetrayAccessToken) {
        // Go to oauth flow.
        req.session.pdBetrayState = Math.floor(Math.random() * 1100000000000).toString();
        return LayoutLocalService.getBetableSDK('pdBetray').authorize(res, req.session.pdBetrayState);
    } else {
        // Have oauth tokens!
        LayoutLocalService.getLayout(req, function (e, d) {
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

var LayoutLocalService = require('layout/service/LayoutLocalService')
  , RouterLocalService = require('core/service/RouterLocalService')
;
