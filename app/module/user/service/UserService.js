var _ = require('underscore')
  , util = require('util')
  , BaseService = require('core/service/BaseService')
  , UserLocalService = require('user/service/UserLocalService')
;

// Constants
//----------------------------------------------------------------------------------------------------------------------
var _namespace = 'users';

// Constructor
//----------------------------------------------------------------------------------------------------------------------
var Module = function () {
    BaseService.call(this, _namespace);
};
util.inherits(Module, BaseService);

// Prototype
//----------------------------------------------------------------------------------------------------------------------
Module.prototype.attachRoutes = function () {
    BaseService.prototype.attachRoutes.call(this);

    this.server.get('/', _(this.logout).bind(this));
};

Module.prototype.create = function (req, res, next) {
    var userRaw = {
        userName: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        fbUser : req.session.auth.facebook
    };
    UserLocalService.createUser(userRaw, function (e, user){
        if (e) {
            return res.send(404);
        } else if (user) {
            delete req.session.auth;
            req.session.user = user.toServerSessionUser();
            return res.json(user.toClientSessionUser());
        }
    });
};

Module.prototype.resetUsers = function (req, res, next) {
    UserLocalService.resetUsers(function (e, d) {
        return res.json(arguments);
    });
};

Module.prototype.show = function (req, res, next) {
    var self = this;
    var id = '' + req.params.id;

    UserLocalService.getById(id, function (e, d) {
        if (e) {
            if (e === 'noSuchUser') {
                return res.send(404);
            } else {
                return res.send(500);
            }
        } else if (d) {
            return res.send(JSON.stringify(d));
        } else {
            return res.send(500);
        }
    });
};

Module.prototype.logout = function (req, res, next) {
    if (req.query.page === 'logout') {
        req.session.destroy();
        res.redirect('/');
    } else {
        next();
    }
};

var instance = new Module();
module.exports = instance;
