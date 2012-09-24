var _ = require('underscore')
  , BaseUtil = require('core/BaseUtil')
;

// Constants
//----------------------------------------------------------------------------------------------------------------------
var _keys = [
    {shortKey: '_id', longKey: 'id'}
  , {shortKey: 'e', longKey: 'email'}
  , {shortKey: 'fbUId', longKey: 'fbUId'}
  , {shortKey: 'fbU', longKey: 'fbUser'}
  , {shortKey: 'fbUn', longKey: 'fbUsername'}
  , {shortKey: 'fname', longKey: 'firstName'}
  , {shortKey: 'lname', longKey: 'lastName'}
  , {shortKey: 'p', longKey: 'password'}
  , {shortKey: 't', longKey: 'type'}
];

var decodeMap = {};
var encodeMap = {};
_(_keys).each(function (v, i) {
    decodeMap[v.shortKey] = v.longKey;
    encodeMap[v.longKey] = v.shortKey;
});

// Constructor
//----------------------------------------------------------------------------------------------------------------------
var Module = function (id, firstName, lastName, email, password, fbUId, fbUser, twName) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
    this.fbUId = fbUId;
    this.fbUser = fbUser;
    this.twName = twName;
};

Module.ID = 7;

Module.fromMongo = function (doc) {
    var o = new Module();
    o.setKey(doc, 'id', Module.encode);
    o.setKey(doc, 'firstName', Module.encode);
    o.setKey(doc, 'lastName', Module.encode);
    o.setKey(doc, 'email', Module.encode);
    o.setKey(doc, 'password', Module.encode);
    o.setKey(doc, 'fbUId', Module.encode);
    o.setKey(doc, 'fbUser', Module.encode);
    o.setKey(doc, 'fbUsername', Module.encode);
    o.setKey(doc, 'twName', Module.encode);
    return o;
};

Module.fromJSON = function (json) {
    var o = new Module();
    o.setKey(json, 'id');
    o.setKey(json, 'firstName');
    o.setKey(json, 'lastName');
    o.setKey(json, 'email');
    o.setKey(json, 'password');
    o.setKey(json, 'fbUId');
    return o;
};

Module.fromServerSessionUser = function (json) {
    var o = new Module();
    _(json).each(function (v, k) {
        o[k] = v;
    });
    return o;
};

Module.encode = function (inKey) {
    return encodeMap[inKey] || inKey;
};

Module.decode = function (inKey) {
    return decodeMap[inKey] || inKey;
};

//Prototype
//----------------------------------------------------------------------------------------------------------------------
Module.prototype.setKey = function (doc, key, encode) {
    var val = encode ? doc[encode(key)] : doc[key];
    if (_.isArray(val) && val.length > 0) {
        this[key] = val;
        return this;
    } else if (!_.isNull(val) && !_.isUndefined(val)) {
        this[key] = val;
        return this;
    }
    return this;
};

Module.prototype.getEmail = function () {
    return this.email;
};

Module.prototype.getFbUId = function () {
    return this.fbUId;
};

Module.prototype.getFirstName = function () {
    return this.firstName;
};

Module.prototype.getId = function () { 
    return this.id;
};

Module.prototype.getLastName = function () {
    return this.lastName;
};

Module.prototype.getPassword = function () {
    return this.password;  
};

Module.prototype.getFbUId = function () {
    return this.fbUId;
};

Module.prototype.getFbUser = function () {
    return this.fbUser;
};

Module.prototype.getFbUsername = function () {
    return this.fbUsername;
};

Module.prototype.getTwitterName = function () {
    return this.twName;
};

Module.prototype.getType = function () {
    return Module.ID;
};

Module.prototype.toMongo = function () {
    var doc = {};
    doc[Module.encode('email')] = this.getEmail();
    doc[Module.encode('firstName')] = this.getFirstName();
    doc[Module.encode('lastName')] = this.getLastName();
    doc[Module.encode('password')] = this.getPassword();
    doc[Module.encode('type')] = this.getType();
    if (_(this.getId()).isUndefined()) {
        doc[Module.encode('_id')] = '' + Math.floor(Math.random() * BaseUtil.getMaxInt());
    } else {
        doc[Module.encode('_id')] = this.getId();
    }
    doc[Module.encode('fbUId')] = this.getFbUId();
    doc[Module.encode('fbUsername')] = this.getFbUsername();
    doc[Module.encode('fbUser')] = this.getFbUser();
    doc[Module.encode('twName')] = this.getTwitterName();
    return doc;
};

Module.prototype.toJSON = function () {
    return this.toServerSessionUser();
};

Module.prototype.toClientSessionUser = function () {
    var json = {};
    json.id = this.getId();
    json.firstName = this.getFirstName();
    json.lastName = this.getLastName();
    json.email = this.getEmail();
    json.fbUsername = this.getFbUsername();
    return json;
};

Module.prototype.toServerSessionUser = function () {
    var json = {};
    json.id = this.getId();
    json.firstName = this.getFirstName();
    json.lastName = this.getLastName();
    json.email = this.getEmail();
    json.fbUsername = this.getFbUsername();
    return json;
};

module.exports = Module;
