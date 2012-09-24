var _ = require('underscore')
  , util = require('util')
  , app = require('')
  , config = app.getConfig()
  , BaseService = require('core/service/BaseService')
  , Betable = require('betable-oauth-node-sdk')(config.getBetableOAUTHSettings())
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
    this.server.get(config.getApiUrl('oauth2.0-redirect/betable'), _(this.betableOAUTHCallback).bind(this));
};

//https://github.com/betable/betable-node-sample/blob/master/server.js
Module.prototype.betableOAUTHCallback = function (req, res, next) {
    var code = req.query.code
      , state = req.query.state
    ;
    
    if (!state || state != req.session.state) {
        delete req.session.state;
        return res.send({error: 'bad state'}, 400);
    }
    delete req.session.state;

    if (req.query.error) {
        return res.send('we got an error', req.query.error)
    }
    
    Betable.token(code, function (e, accessToken) {
        if (e) {
            return res.send({error: error}, 400);
        }

        req.session.accessToken = accessToken;
        return res.redirect(config.getHostName());
    });
};

Module.prototype.layout = function (req, res, next) {
    // TODO: This should be an attribute of an user object.
    if (!req.session.accessToken) {
        req.session.state = Math.floor(Math.random() * 1100000000000).toString();
        return Betable.authorize(res, req.session.state);
    }

    Betable.get(['account', 'wallet'], req.session.accessToken, function (e, d) {
        console.log(arguments);
    });

    return res.send(LayoutLocalService.toHTML(req));
};

Module.prototype.readListRoutes = function (req, res, next) {
    return res.json(RouterLocalService.toJSON());
};

var instance = new Module();
module.exports = instance;

var RouterLocalService = require('core/service/RouterLocalService')
;
