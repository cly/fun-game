var _ = require('underscore')
  , connect = require('connect')
  , connectAuth = require('connect-auth')
  , everyauth = require('everyauth')
  , express = require('express')
  , log4js = require('log4js')
  , RedisStore = require('connect-redis')(connect)
  , app = require('')
  , config = app.getConfig()
  , BasicUser = require('user/model/BasicUser')
  , DeployLocalService = require('core/service/DeployLocalService')
  , RouterLocalService = require('core/service/RouterLocalService')
  , UserLocalService = require('user/service/UserLocalService')
;

// Constructor
//----------------------------------------------------------------------------------------------------------------------
var Module = function () {
    this._logger = log4js.getLogger();
};

// Prototype
//----------------------------------------------------------------------------------------------------------------------
Module.prototype._contextWrap = function (jsContent) {
    return '(function (app) {\n\n' + jsContent + '\n\n})(__APP);';

};

Module.prototype._logRequest = function (req, res, next) {
    var self = this;
    req.startedMiddleware = Date.now();

    var proxy = res.send;
    res.send = function () {
        var now = Date.now();
        var took = now - req.startedMiddleware;
        self._logger.info([took + 'ms', req.method, req.url, req.socket.remoteAddress].join(' '));
        proxy.apply(this, arguments);
    };

    return next();
};

Module.prototype.delay = function (delay) {
    return function (req, res, next) {
        setTimeout(function() {
            return next();
        }, delay);
    };
};

Module.prototype.devStatic = function (req, res, next) {
    if (!this.staticFiles) {
        this.staticFiles = DeployLocalService.getClientJSFiles();
    }
    if (this.staticFiles[req.url]) {
        res.header('Content-Type', 'text/javascript');
        return res.send(this._contextWrap(this.staticFiles[req.url]));
    } else {
        return next();
    }
};

Module.prototype.startServer = function (cb) {
    var self = this;
    this.server = express();

    if (config.isDevelopment()) {
        this.server.use(_(this.devStatic).bind(this));
    }

    if (config.isProduction()) {
        this.server.use(express.basicAuth('betable', 'charlie'));
    }

    everyauth.facebook
    .appId(config.getFacebookAppId())
    .appSecret(config.getFacebookAppSecret())
    .entryPath('/auth/facebook')
    .callbackPath('/auth/facebook/callback')
    .scope('email')
    .handleAuthCallbackError(function (req, res) {
        req.logout();
        console.log('auth failed');
    })
    .findOrCreateUser(function (session, accessToken, extra, oauthUser) {
        // Do a look up by fb user;
        var promise = this.Promise();
        var facebookId = oauthUser.id;
        UserLocalService.getByFacebookId(facebookId, function (e, user) {
            if (e) {
                promise.fulfill(oauthUser);
            } else if (!user) {
                promise.fulfill(oauthUser);
            } else {
                session.user = user.toServerSessionUser();
                promise.fulfill(user);
            }
        });
        return promise;
    })
    .redirectPath('/')
    .sendResponse(function (res) {
        // This library is fucking annoying.
        var redirectTo = this._redirectPath;
        /*
        if (!redirectTo)
            throw new Error('You must configure a redirectPath');
        console.log(redirectTo);
        this.redirect(res, redirectTo);
        */
        res.redirect(redirectTo);
    });

    this.server.use(express.static(config.getCwd() + '/public'));
    this.server.use(_(this._logRequest).bind(this));
    this.server.use(express.bodyParser());
    this.server.use(express.cookieParser());
    this.server.use(express.session({
        store: new RedisStore()        
      , key: 'sid'
      , secret: 'weriu837423423'
    }));

    // Convert session user to an user object
    this.server.use(function (req, res, next) {
        if (req.session && req.session.user) {
            req.session.user = BasicUser.fromServerSessionUser(req.session.user);
        } else if (config.isDevelopment()) {
            if (config.getGuestUserId()) {
                //req.session.user = BasicUser.fromServerSessionUser({id: config.getGuestUserId()});
                //console.info('User not logged in, but faking ' + config.getGuestUserId());
            } else {
                console.info('User not logged in');
            }
        }
        next();
    });

    this.server.use(everyauth.middleware());
    /*
    this.server.use(connectAuth([
        connectAuth.Facebook({
            appId: config.getFacebookAppId()
          , appSecret: config.getFacebookAppSecret()
          , scope: 'email'
          , callback : config.getFacebookOAuthCallback()
        })
    ]));
    */
    this.server.use(this.server.router);

    RouterLocalService.init({server: this.server});
    RouterLocalService.attachRoutes(this.server);

    this.server.use(express.errorHandler({showStack: true, dumpExceptions: true}));

    app.connectPersistence(function (e, d) {
        if (e) {
            console.log('could not connect to persistence');
            process.exit();
        }
        self.server.listen(config.getServerPort());
        self._logger.info('Application server started.');
        //self._logger.info(config.toString());
        return cb(e, this.server);
    });
};

var instance = new Module();
module.exports = instance;
