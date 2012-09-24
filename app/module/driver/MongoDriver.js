var _ = require('underscore')
  , app = require('')
  , config = app.getConfig()
  , mongodb = require('mongodb')
;

// Constants
//----------------------------------------------------------------------------------------------------------------------
var DEFAULT_SERVER_OPTIONS = {
    auto_reconnect: true
};

var DEFAULT_DB_OPTIONS = {
};

var DEFAULT_DB_NAME = 'cly';

var DELIMITER = ':';

var MAX_CONNECTION_ATTEMPTS = 5;

// Private and Helpers
//----------------------------------------------------------------------------------------------------------------------
var _dbClient = null;

var _getServer = function (host, port, options) {
    options || (options = DEFAULT_SERVER_OPTIONS);

    var server = new mongodb.Server(host, port, options);
    return server;
};

var _getDbClient = function (dbName, server, options, tries, cb) {
    if (--tries < 0) {
        return cb('Could not connect after all tries');
    }
    options || (options = DEFAULT_DB_OPTIONS);

    var db = new mongodb.Db(dbName, server, options).open(function (e, dbClient) {
        if (e) {
            console.log(e);
            //TODO: handle it, retry, etc
            return cb(e);
        }
        return cb(null, dbClient);
    });
};

// Constructor
//----------------------------------------------------------------------------------------------------------------------
var Module = function () {
    this.server = _getServer(config.getMongoHost(), config.getMongoPort());
    this.startedConnection = false;
};

// Prototype
//----------------------------------------------------------------------------------------------------------------------
Module.prototype.getDbClient = function (cb) {
    if (_dbClient) {
        // Already connected. Return.
        return cb(null, _dbClient);
    } else if (!_dbClient && !this.startedConnection) {
        // Not connected and no one else has asked for connection. Attempt connection.
        this.startedConnection = true;
        _getDbClient(DEFAULT_DB_NAME, this.server, {strict: true}, MAX_CONNECTION_ATTEMPTS, function (e, c) {
            if (!e && c) {
                _dbClient = c;
                return cb(null, _dbClient);
            }
        });
    } else {
        // Not connected but someone else has asked for connection. Attempt to return connection later.
        // TODO: try multiple times.
        setTimeout(function () {
            if (_dbClient) {
                return cb(null, _dbClient);
            } else {
                return cb('Could not get connection that someone else initiated');
            }
        }, 1000);
    }
};

Module.prototype.getDelimiter = function () {
    return DELIMITER;
};

Module.prototype.isDuplicateError = function (error) {
    return error.code === 11000;
};


var instance = new Module();
module.exports = instance;
