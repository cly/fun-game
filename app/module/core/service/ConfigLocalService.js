var _ = require('underscore')
  , path = require('path')
  , util = require('util')
;

// Private
//----------------------------------------------------------------------------------------------------------------------

// Use 'derived' to denote keys that are derived which are processed in this.init.
var _configs = {};
_configs.base = {
    'api.version': 1
  , 'api.version.rootUrl': 'derived'
  , 'betable.games': [
        {
            name: 'pdCooperate'
          , id: 'PBa90YJmAGp1ZCLV24-Ndz'
          , APIKey: 'Gkv3abVHZ2OSIR5DiNGGmbXvcJJPBvTy'
          , APISecret: 'upDmxJgqAytyzCXUbZEmQ37A9gfqNXAT'
        }
      , {
            name: 'pdBetray'
          , id: 'jdRH0nSS2l47-NmjXC1TI6'
          , APIKey: 'TryOmpAoeD53TFyTpo1YLbbTOpJNX5i3'
          , APISecret: 'cPznt3eVwVX8zsz44it2w2NAxyW5ZLGI'
        }
    ]
  , 'betable.OAUTHRedirectPath': 'oauth2.0-redirect/betable'
  , 'client.js.fileNames': [
        {
            path: 'public/js/'
          , fileNames: [
                'json2'
              , 'plugins'
              , 'underscore'
              , 'backbone'
              , 'templates'
              , 'jquery.imagesloaded'
              , 'jquery.autogrow'
              , 'betable-browser-sdk'
            ]
          , ext: '.js'
        }
      , {
            path: 'app/module/bootstrap/js'
          , fileNames: [
    //            'bootstrap-transition'
    //          , 'bootstrap-alert'
                'bootstrap-modal'
    //          , 'bootstrap-dropdown'
    //          , 'bootstrap-scrollspy'
    //          , 'bootstrap-tab'
    //          , 'bootstrap-tooltip'
    //          , 'bootstrap-popover'
    //          , 'bootstrap-button'
    //          , 'bootstrap-collapse'
    //          , 'bootstrap-carousel'
    //          , 'bootstrap-typeahead'
            ]
          , ext: '.js'
        }
      , {
            path: 'app/module/layout/client'
          , fileNames: ['start', 'LayoutView', 'BasePage']
          , ext: '.js'
        }
      , {
            path: 'app/module/game/client'
          , fileNames: ['GameRouter', 'GameModel', 'GameView']
          , ext: '.js'
        }
      , {
            path: 'app/module/layout/client'
          , fileNames: ['end']
          , ext: '.js'
        }
    ]
  , 'client.template.fileNames': [
        { 
            path: 'app/module/user/template' 
          , fileNames: ['user'] 
          , ext: '.html' 
        } 
      , { 
            path: 'app/module/game/template' 
          , fileNames: ['game'] 
          , ext: '.html' 
        } 
    ] 
  , 'exitCode': 100
  , 'facebook.appId': '313282792072364'
  , 'facebook.appSecret': 'dc13911f280ffbd94c1ad68b519941b7'
  , 'facebook.OAuthCallback': 'http://somehost/auth/facebook/callback'
  , 'hostName': 'http://ec2-204-236-159-159.us-west-1.compute.amazonaws.com'
  , 'process.env.NODE_ENV': 'development'
  , 'process.env.NODE_PATH': 'derived'
  , 'server.port': 8080
  , 'server.routes.fileNames': [ 
        'game/service/GameService'
    ]
  , 'session.key': 'sid'
  , 'session.secret': 'asdfwerwer'
  , 'mongo.host': '127.0.0.1'
  , 'mongo.port': 27017
  , 'module.relativePath': 'app/module'
  , 'module.path': 'derived'
};

_configs.production = {
    'cwd': '/betable/fun-game'
  , 'process.env.NODE_ENV': 'production'
  , 'server.port': 80
};

_configs.development = {
    'process.env.NODE_ENV': 'development'
};

_configs.charlie = {
    'cwd': '/betable/fun-game'
  , 'guest.user.id': 'charlie.liang.yuan'
  , 'client.js.fileNames': [
        {
            path: 'public/js/'
          , fileNames: [
                'json2'
              , 'plugins'
              , 'underscore'
              , 'backbone'
              , 'templates'
              , 'jquery.imagesloaded'
              , 'jquery.autogrow'
              , 'betable-browser-sdk'
              , 'chai'
            ]
          , ext: '.js'
        }
      , {
            path: 'app/module/bootstrap/js'
          , fileNames: [
    //            'bootstrap-transition'
    //          , 'bootstrap-alert'
                'bootstrap-modal'
    //          , 'bootstrap-dropdown'
    //          , 'bootstrap-scrollspy'
    //          , 'bootstrap-tab'
    //          , 'bootstrap-tooltip'
    //          , 'bootstrap-popover'
    //          , 'bootstrap-button'
    //          , 'bootstrap-collapse'
    //          , 'bootstrap-carousel'
    //          , 'bootstrap-typeahead'
            ]
          , ext: '.js'
        }
      , {
            path: 'app/module/layout/client'
          , fileNames: ['start', 'LayoutView', 'BasePage']
          , ext: '.js'
        }
      , {
            path: 'app/module/game/client'
          , fileNames: ['GameRouter', 'GameModel', 'GameView']
          , ext: '.js'
        }
      , {
            path: 'app/module/layout/client'
          , fileNames: ['end']
          , ext: '.js'
        }
      , {
            path: 'app/module/game/client'
          , fileNames: ['test/GameModelTest']
          , ext: '.js'
        }
    ]
};

var _toPrettyJSON = function (temp) {
    var config = {};
    _(temp).each(function (value, key) {
        var fields = key.split('.');

        // Construct JSON structure.
        var ref = config;
        var field;
        for (var i = 0, ii = fields.length - 1; i < ii; ++i) {
            field = fields[i];
            ref[field] || (ref[field] = {});
            ref = ref[field];
        }

        // Add field value.
        ref[fields[i]] = value;
    });
    return config;
};

// Constructor
//----------------------------------------------------------------------------------------------------------------------
var Module = function () {
};

// Prototype
//----------------------------------------------------------------------------------------------------------------------
Module.prototype.init = function (configName) {
    if (_.isUndefined(configName)) {
        console.log('configName is undefined');
        console.log((new Error()).stack);
        process.exit();
    }

    if (_.isUndefined(_configs[configName]) || configName === 'base') {
        console.log('configName is invalid');
        console.log((new Error()).stack);
        process.exit();
    } else if (configName === 'development' || configName === 'staging' || configName == 'production') {
        // Normal settings.
        this._config = _toPrettyJSON(_.extend(_configs.base, _configs[configName]));
    } else {
        // Custom development settings.
        this._config = _toPrettyJSON(_.extend(_.extend(_configs.base, _configs.development), _configs[configName]));
    }

    // Derived parameters.
    this._config.api.rootUrl = '/api/' + this._config.api.version + '/';
    this._config.process.env.NODE_PATH = [this._config.cwd + '/app', this._config.cwd + '/app/module'].join(':');
    this._config.module.path = this._config.cwd + '/app/module';
    return this;
};

Module.prototype.getApiUrl = function () {
    var args = Array.prototype.slice.apply(arguments);
    args.unshift(this._config.api.rootUrl);
    return path.join.apply(this, args);
};

Module.prototype.getCwd = function () {return this._config.cwd;};
Module.prototype.getClientJSFileNames = function () {return this._config.client.js.fileNames;};
Module.prototype.getClientTemplateFileNames = function () {return this._config.client.template.fileNames;};
Module.prototype.getBetableGames = function () {return this._config.betable.games;};
Module.prototype.getBetableOAUTHRedirectPath = function () {return this._config.betable.OAUTHRedirectPath;};
Module.prototype.getBetableOAUTHRedirectURI = function () {
    return this.getHostName() + this.getApiUrl(this._config.betable.OAUTHRedirectPath);
};
Module.prototype.getBetableOAUTHSettings = function () {
    var self = this;
    var result = {};
    _(this.getBetableGames()).each(function (game) {
        result[game.name] = {
            apiKey: game.APIKey
          , apiSecret: game.APISecret
          , name: game.name
          , id: game.id
          , redirectUri: self.getBetableOAUTHRedirectURI()
        };
    });
    return result;
};
Module.prototype.getFacebookAppId = function () {return this._config.facebook.appId;};
Module.prototype.getFacebookAppSecret = function () {return this._config.facebook.appSecret;};
Module.prototype.getFacebookOAuthCallback = function () {return this._config.facebook.OAuthCallback;};
Module.prototype.getGuestUserId = function () {return this._config.guest.user.id;};
Module.prototype.getHostName = function () {return this._config.hostName;};
Module.prototype.getProcessEnv = function () {return this._config.process.env;};
Module.prototype.getExitCode = function () {return this._config.exitCode;};
Module.prototype.getModulePath = function () {return this._config.module.path;};
Module.prototype.getMongoHost = function () {return this._config.mongo.host;};
Module.prototype.getMongoPort = function () {return this._config.mongo.port;};
Module.prototype.getPath = function () {
    var args = Array.prototype.slice.apply(arguments);
    args.unshift(this.getCwd());
    return path.join.apply(this, args);
};
Module.prototype.getServerPort = function () {return this._config.server.port;};
Module.prototype.getServerRoutes = function () {return this._config.server.routes.fileNames;};
Module.prototype.getSessionConfig = function (store) {
    return {
        store: store
      , key: this._config.session.key
      , secret: this._config.session.secret
    };
};
Module.prototype.isDevelopment = function () {return this._config.process.env.NODE_ENV === 'development';};
Module.prototype.isProduction = function () {return this._config.process.env.NODE_ENV === 'production';};
Module.prototype.toString = function () {return util.inspect(this._config, false, null);};

var instance = new Module();
module.exports = instance;
