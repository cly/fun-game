var _ = require('underscore')
;

// Constructor
//----------------------------------------------------------------------------------------------------------------------
var Module = function () {
};

Module.prototype.init = function (options) {
    this.server = options.server;
};

// Prototype
//----------------------------------------------------------------------------------------------------------------------
Module.prototype._notFound = function (req, res, next) {
    res.send('404');
};

Module.prototype.attachRoutes = function () {
    var self = this;
    var serviceFileNames = [
        'user/service/UserService'
      , 'layout/service/LayoutService'
    ];

    _(serviceFileNames).each(function (serviceFileName) {
        var service = require(serviceFileName);
        service.init({server: self.server});
        service.attachRoutes();
    });
};

Module.prototype.toJSON = function () {
    if (this.server) {
        var output = [];
        var routes = this.server.routes;
        _([routes.get, routes.post, routes.put, routes.delete]).each(function (method, i) {
            _(method).each(function (route, i) {
                output.push((route.method + '    ').substring(0, 7) + route.path);
            });
        });
        return output;
    } else {
        throw new Error('not ready');
    }
};

Module.prototype.toString = function () {
    this.toJSON().join('\n');
};

var instance = new Module();
module.exports = instance;
