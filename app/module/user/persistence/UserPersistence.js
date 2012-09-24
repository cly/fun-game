var _ = require('underscore')
  , util = require('util')
  , BaseMongoPersistence = require('core/BaseMongoPersistence')
  , BasicUser = require('user/model/BasicUser')
  , Users = require('user/model/Users')
;

// Constant
//----------------------------------------------------------------------------------------------------------------------
var MAX_INT = Math.pow(2, 32) - 1;

// Private
// ----------------------------------------------------------------------------------------------------------------------
var _collectionName = 'user';
var _collectionClass = Users;
var _modelFolder = 'user/model/';
var _classNames = ['BasicUser'];

var _keys = [
    {shortKey: '_id', longKey: '_id'}
  , {shortKey: 'e', longKey: 'email'}
  , {shortKey: 'fbId', longKey: 'fbId'}
  , {shortKey: 'fname', longKey: 'firstName'}
  , {shortKey: 'lname', longKey: 'lastName'}
  , {shortKey: 'p', longKey: 'password'}
  , {shortKey: 't', longKey: 'type'}
];

// Constructor
// ----------------------------------------------------------------------------------------------------------------------
var Module = function () {
    BaseMongoPersistence.call(this, _collectionName, _collectionClass, _modelFolder, _classNames, _keys);
};
util.inherits(Module, BaseMongoPersistence);

// Prototype
// ----------------------------------------------------------------------------------------------------------------------
Module.prototype.toMongo = function (model) {
    return model.toMongo();
};

Module.prototype.fromMongo = function (doc) {
    var self = this;
    var classId = doc[self.encode('type')];
    var clazz = self.getClassByClassId(classId);
    if (clazz) {
        return clazz.fromMongo(doc);
    }
};

Module.prototype.findByFbId = function (fbId, cb) {
    var self = this;
    var query = {};

    query[self.encode('fbId')] = fbId;
    self.findOne(query, function (e, d) {
        return cb(e, d);
    });
};

Module.prototype.findByIds = function (ids, cb) {
    var self = this;
    var query = {_id : {$in: ids}};
    var sort = {};
    self.find(query, sort, null, function (e, c) {
        return cb(e, c);
    });
};

var instance = new Module();
module.exports = instance;
