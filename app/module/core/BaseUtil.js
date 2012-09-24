var  _ = require('underscore')
  , request = require('request')
;

// Constants
//----------------------------------------------------------------------------------------------------------------------
var MAX_INT = Math.pow(2, 32) - 1;
var MAX_NUMBER = 9007199254740992;
var ID_DELIMITER = "_";

// Constructor
//----------------------------------------------------------------------------------------------------------------------
var Module = function () {
};

// Prototype
//----------------------------------------------------------------------------------------------------------------------
Module.prototype.JSONparse = function (inputString) {
    try {
        var json = JSON.parse(inputString);
        return json;
    } catch (e) {
        return null;
    }
};

Module.prototype.getMaxInt = function () {
    return MAX_INT;
};

Module.prototype.getMaxNumber = function () {
    return MAX_NUMBER;
};

Module.prototype.getIdDelimiter = function () {
    return ID_DELIMITER;
};

Module.prototype.assignArrayIfNotEmpty = function (j, key, a) {
    if (_.isArray(a) && a.length > 0) {
        j[key] = a;
    }
};

Module.prototype.assignStringIfNotEmpty = function (j, key, s) {
    if (_.isString(s) && s.length > 0) {
        j[key] = s;
    }
};

// TODO: should be spelt sluggify
Module.prototype.slugify = function (text) {
    text = text.trim();
    text = text.replace(/[^-a-zA-Z0-9,&\s]+/ig, '');
    text = text.replace(/-/gi, "_");
    text = text.replace(/\s/gi, "-");
    text = text.toLowerCase();
    return text;
};

Module.prototype.resolveHttpRedirects = function (url, cb) {
    request(url, function(error, response, body){
        if(error){
            cb(error, null);
        } else {
            cb(null, response.request.uri.href); 
        }
    });
};

Module.prototype.assignIfNumber = function (o, key, num) {
    if (_.isNumber(+num) && !_.isNaN(+num)) {
        o[key] = +num;
    }
    return o;
};

Module.prototype.assignIfString = function (o, key, str) {
    if (_.isString(str)) {
        o[key] = str;
    }
    return o;
};

Module.prototype.objectToQuery = function (obj) {
    var str = [];
    for (var p in obj) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
    return str.join("&");
};

var proxy = console.log;
console.log = function () {
    //console.trace();
    proxy.apply(this, arguments);
};

var instance = new Module();
module.exports = instance;
