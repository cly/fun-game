var _ = require('underscore')
  , app = require('')
  , config = app.getConfig()
;

// Constructor
//----------------------------------------------------------------------------------------------------------------------
var Module = function (namespace) {
    this.namespace = namespace;
};

Module.prototype.init = function (opts) {
    this.server = opts.server;
};

/*
 See http://guides.rubyonrails.org/routing.html.
 HTTP   Path                action  used for
 --------------------------------------------------------------------------------
 GET    /photos             index   display a list of all photos
 GET    /photos/new         new     return an HTML form for creating a new photo
 POST   /photos             create  create a new photo
 GET    /photos/:id         show    display a specific photo
 GET    /photos/:id/edit    edit    return an HTML form for editing a photo
 PUT    /photos/:id         update  update a specific photo
 DELETE /photos/:id         destroy delete a specific photo
*/

// Prototype
//----------------------------------------------------------------------------------------------------------------------
Module.prototype.attachRoutes = function () {
    this.server.get(config.getApiUrl(this.namespace), _(this.index).bind(this));
    this.server.post(config.getApiUrl(this.namespace), _(this.create).bind(this));
    this.server.del(config.getApiUrl(this.namespace), _(this.reset).bind(this));

    this.server.get(config.getApiUrl(this.namespace + '/:id'), _(this.show).bind(this));
    this.server.put(config.getApiUrl(this.namespace + '/:id'), _(this.update).bind(this));
    this.server.del(config.getApiUrl(this.namespace + '/:id'), _(this.destroy).bind(this));
};

Module.prototype.formatError = function (e) {
    return {
        status: 'error'
      , message: e
    };
};

Module.prototype.assertUser = function (req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.send(401);
    }
};

Module.prototype.respond = function (e, d, res, dCb) {
    var self = this;
    if (e) {
        return res.json(self.formatError(e));
    } else if (_.isNull(d)) {
        return res.send(404);
    }
    return res.json(dCb(d));
};

var baseApis = [
    'index'
  , 'create'
  , 'show'
  , 'update'
  , 'destroy'
  , 'reset'
];

var baseHandler = function (req, res, next) {
    res.send(401);
};

_(baseApis).each(function (baseApi) {
    Module.prototype[baseApi] = baseHandler;
});

module.exports = Module;
