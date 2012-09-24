var _ = require('underscore')
  , async = require('async')
  , BaseUtil = require('core/BaseUtil')
  , BasicUser = require('user/model/BasicUser')
  , Users = require('user/model/Users')
  , UserPersistence = require('user/persistence/UserPersistence')
;

// Constructor
//----------------------------------------------------------------------------------------------------------------------
var Module = function () {
};

// Prototype
// ----------------------------------------------------------------------------------------------------------------------
Module.prototype.convertUserRaw = function (userRaw) {
    var id = userRaw.userName;
    var firstName = userRaw.firstName;
    var lastName = userRaw.lastName;
    var email = userRaw.email;
    var password = userRaw.password;
    var fbUser = userRaw.fbUser;
    var fbUId;
    if (fbUser !== undefined) {
        fbUId = fbUser.user.id; 
    }
    var model = new BasicUser(id, firstName, lastName, email, password, fbUId, fbUser, null, 0);
    model.fbUsername = fbUser.user.username;
    return model;
};

Module.prototype.createUser = function (userRaw, cb) {
    console.log("creating user " + JSON.stringify(userRaw));
    var basicUser = this.convertUserRaw(userRaw);
    UserPersistence.insertOne(basicUser, function (e, d) {
        return cb (e, d);
    });
};

Module.prototype.findById = function (id, cb) {
    UserPersistence.findById(id, function (e, d) {
       return cb(e, d); 
    });
};

Module.prototype.findByIds = function (ids, cb) {
    UserPersistence.findByIds(ids, function (e, d){
        return cb(e, d);
    });
};

Module.prototype.getByFacebookId = function (facebookId, cb) {
    UserPersistence.findByFbId(facebookId, function (e, d) {
        return cb(e, d);
    });
};

Module.prototype.getById = function (id, cb) {
    var self = this;
    async.parallel({
        user : function (cb) {
            self.findById(id, function (e, user) {
                return cb(e, user);
            });
        }
    }, function (e, d) {
        if (e) {
            return cb(e);
        } else if (_.isNull(d) || _.isNull(d.user)) {
            return cb('noSuchUser');
        }
        var response = {};
        response.user = d.user;
        return cb(null, response);
    });
};

var instance = new Module();
module.exports = instance;

