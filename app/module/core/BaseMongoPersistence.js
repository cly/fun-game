var _ = require('underscore')
  , mongodb = require('mongodb')
  , MongoDriver = require('driver/MongoDriver')
;

// Private
//----------------------------------------------------------------------------------------------------------------------
//TODO: refactor this out.
var _collections = {}

// Constructor
//----------------------------------------------------------------------------------------------------------------------
var Module = function (collectionName, collectionClass, modelFolder, classNames, keys) {
    var self = this;
    self._collectionName = collectionName;
    self._collectionClass = collectionClass;
    self.decodeMap = {};
    self.encodeMap = {};
    _(keys).each(function (v, i) {
        self.decodeMap[v.shortKey] = v.longKey;
        self.encodeMap[v.longKey] = v.shortKey;
    });

    this.classIdToClassMap = {};
    this.classNameToClassIdMap = {};
    this.classNameToClassMap = {};

    for (var i = 0, ii = classNames.length; i < ii; ++i) {
        var className = classNames[i];

        var clazz = require(modelFolder + className);
        var classId = clazz.ID;
        var className = className;

        if (!_.isUndefined(this.classIdToClassMap[classId])) {
            console.log('Should not use same classId: ' + classId);
            process.exit();
        }
        this.classIdToClassMap[classId] = clazz;
        this.classNameToClassIdMap[className] = classId;
        this.classNameToClassMap[className] = clazz;
    }
};

// Prototype
//----------------------------------------------------------------------------------------------------------------------
Module.prototype.encode = function (inKey) {
    return this.encodeMap[inKey] || inKey;
};

Module.prototype.decode = function (inKey) {
    return this.decodeMap[inKey] || inKey;
};

Module.prototype.getClassByClassId = function (classId) {
    return this.classIdToClassMap[classId];
};

Module.prototype.getClassIdByClassName = function (className) {
    return this.classNameToClassIdMap[className];
};

Module.prototype.getClassByClassName = function (className) {
    return this.classNameToClassMap[className];
};

Module.prototype.getCollection = function (collectionName, cb) {
    var collection = _collections[collectionName];
    if (collection) {
        return cb(null, collection);
    } else {
        MongoDriver.getDbClient(function (e, dbClient) {
            collection = new mongodb.Collection(dbClient, collectionName);
            _collections[collectionName] = collection;
            return cb(null, collection);
        });
    }
};

Module.prototype.docsToCollection = function (docs) {
    var self = this;
    if (_.isArray(docs)) {
        var clazz = self._collectionClass;
        if (clazz) {
            var docObjects = [];
            for (var i = 0, ii = docs.length; i < ii; ++i) {
                var doc = docs[i];
                var docObject = self.docToObject(doc);
                docObjects.push(docObject);
            }
            return new self._collectionClass(docObjects);
        }
    } else {
        // Should never be here.
        throw new Error('could not determine objective object');
    }
};

Module.prototype.count = function (cb) {
    var self = this;
    self.getCollection(self._collectionName, function (e, c) {
        c.count({}, function (e, d) {
            if (e) {
                return cb(e || 'error count');
            }
            return cb(null, d);
        });
    });
};

Module.prototype.findAll = function (cb) {
    var self = this;
    var now = Date.now();
    self.getCollection(self._collectionName, function (e, c) {
        c.find().toArray(function (e, docs) {
            var dataCollection = self.docsToCollection(docs);
            console.log(self._collectionName, 'findAll', Date.now() - now + 'ms', 'size=' + dataCollection.size());
            if (e) {
                return cb(e || 'error findAll');
            }
            return cb(null, dataCollection);
        });
    });
};

Module.prototype.findByIdSubset = function (id, fields, cb) {
    var self = this;
    var now = Date.now();
    self.getCollection(self._collectionName, function (e, c) {
        var query = {_id: id};
        c.findOne(query, fields, function (e, doc) {
            if (e) {
                console.log(self._collectionName, 'findByIdSubset', Date.now() - now + 'ms', 'error=' + e);
                return cb(e || 'error findBy');
            } else if (doc) {
                console.log(self._collectionName, 'findByIdSubset', Date.now() - now + 'ms', 'found=' + id);
                return cb(null, self.docToObject(doc));
            } else {
                console.log(self._collectionName, 'findByIdSubset', Date.now() - now + 'ms', 'notExist');
                return cb(null, null);
            }
        });
    });
};

Module.prototype.findById = function (id, cb) {
    var self = this;
    var now = Date.now();
    self.getCollection(self._collectionName, function (e, c) {
        var query = {_id: id};
        c.findOne(query, function (e, d) {
            if (e) {
                console.log(self._collectionName, 'findById', Date.now() - now + 'ms', 'error=' + e);
                return cb(e);
            } else if (_.isNull(d)) {
                console.log(self._collectionName, 'findById', Date.now() - now + 'ms', 'notExist');
                return cb(null, null);
            } else {
                console.log(self._collectionName, 'findById', Date.now() - now + 'ms', 'found=' + id);
                return cb(null, self.docToObject(d));
            }
        });
    });
};

Module.prototype.findOne = function (query, cb) {
    var self = this;
    var now = Date.now();
    self.getCollection(self._collectionName, function (e, c) {
        c.findOne(query, function (e, d) {
            if (e) {
                console.log(self._collectionName, 'findOne', Date.now() - now + 'ms', 'error=' + e);
                return cb(e);
            } else if (_.isNull(d)) {
                console.log(self._collectionName, 'findOne', Date.now() - now + 'ms', 'notExist');
                return cb(null, null);
            } else {
                console.log(self._collectionName, 'findOne', Date.now() - now + 'ms', 'found=' + d._id);
                return cb(null, self.docToObject(d));
            }
        });
    });
};

Module.prototype.find = function (query, sort, limit, cb) {
    var self = this;
    var now = Date.now();
    var options = {};
    if (!_.isNull(sort)) {
        options.sort = sort;
    }
    if (!_.isNull(limit)) {
        options.limit = limit;
    }
    self.getCollection(self._collectionName, function (e, c) {
        c.find(query, options).toArray(function (e, docs) {
            if (e) {
                console.log(self._collectionName, 'find', 'query=' + JSON.stringify(query), 'sort=' + JSON.stringify(sort), 'limit=' + limit, Date.now() - now + 'ms', 'error=' + e);
                return cb(e || 'error find');
            } else if (docs) {
                // TODO Returns empty array here if no docs found. When does else run?
                console.log(self._collectionName, 'find', 'query=' + JSON.stringify(query), 'sort=' + JSON.stringify(sort), 'limit=' + limit, Date.now() - now + 'ms', 'found ids=' + _(docs).pluck('_id'));
                return cb(null, self.docsToCollection(docs));
            } else {
                console.log(self._collectionName, 'find', 'query=' + JSON.stringify(query), 'sort=' + JSON.stringify(sort), 'limit=' + limit, Date.now() - now + 'ms', 'notExist');
                return cb(null, null);
            }
        });
    });
};

//TODO: Refactor this out.
Module.prototype.docToObject = function (doc) {
    if (doc) {
        return this.fromMongo(doc);
    } else {
        // Should never be here.
        throw new Error('Could not determine event object.');
    }
};

Module.prototype.insertOne = function (obj, cb) {
    var self = this;
    var now = Date.now();
    var options = {safe: true};
    self.getCollection(self._collectionName, function (e, c) {
        var doc = self.toMongo(obj);
        c.insert(doc, options, function (e, d) {
            if (e) {
                console.log(self._collectionName, 'insertOne', Date.now() - now + 'ms', 'error=' + e);
                return cb(e);
            } else if (!_.isNull(d)) {
                console.log(self._collectionName, 'insertOne', Date.now() - now + 'ms', 'id=' + obj.getId());
                return cb(null, self.docToObject(d[0]));
            } else {
                console.log(self._collectionName, 'insertOne', Date.now() - now + 'ms', 'args=', e, d);
                return cb(null, null);
            }
        });
    });
};

Module.prototype.insertAll = function (objs, cb) {
    var self = this;
    var now = Date.now();
    var options = {safe: true};
    self.getCollection(self._collectionName, function (e, c) {
        var raw = [];
        objs.each(function (obj, i) {
            raw.push(self.toMongo(obj));
        });
        c.insert(raw, options, function (e, d) {
            if (e) {
                console.log(self._collectionName, 'insertAll', Date.now() - now + 'ms', 'error=' + e);
                return cb(e);
            } else if (!_.isNull(d)) {
                console.log(self._collectionName, 'insertAll', Date.now() - now + 'ms', 'ids=' + objs.getIds());
                return cb(null, self.docsToCollection(d));
            } else {
                console.log(self._collectionName, 'insertAll', Date.now() - now + 'ms', 'args=', e, d);
                return cb(null, null);
            }
        });
    });
};

Module.prototype.removeAll = function (cb) {
    var self = this;
    var now = Date.now();
    self.getCollection(self._collectionName, function (e, c) {
        c.remove({}, function (e, affected) {
            if (e) {
                console.log(self._collectionName, 'removeAll', Date.now() - now + 'ms', 'error=' + e);
                return cb(e);
            } else if (!_.isNull(affected)) {
                console.log(self._collectionName, 'removeAll', Date.now() - now + 'ms', 'removed=' + affected);
                return cb(null, affected);
            } else {
                console.log(self._collectionName, 'removeAll', Date.now() - now + 'ms', 'args=', e, affected);
                return cb('Error');
            }
        });
    });
};

Module.prototype.findAndModify = function (query, sort, update, options, cb) {
    var self = this;
    var now = Date.now();
    self.getCollection(self._collectionName, function (e, c) {
        c.findAndModify(query, sort, update, options, function (e, affected) {
            if (e) {
                console.log(self._collectionName, 'findAndModify', Date.now() - now + 'ms', 'error=' + e);
                return cb(e);
            } else if (!_.isUndefined(affected) && !_.isNull(affected)) {
                console.log(self._collectionName, 'findAndModify', Date.now() - now + 'ms', 'id=' + affected._id);
                return cb(null, self.docToObject(affected));
            } else {
                console.log(self._collectionName, 'findAndModify', Date.now() - now + 'ms', 'args=', e, affected);
                return cb(null, null);
            }
        });
    });
};

Module.prototype.update = function (query, update, options, cb) {
    var self = this;
    var now = Date.now();
    self.getCollection(self._collectionName, function (e, c) {
        c.update(query, update, options, function(e, count) {
            if (e) {
                console.log(self._collectionName, 'update', Date.now() - now + 'ms', 'error=' + e);
                return cb(e);
            } else if (!_.isUndefined(count) && !_.isNull(count)) {
                console.log(self._collectionName, 'update', Date.now() - now + 'ms', '_id= ' + query._id
                        , 'affected count: '+ count);
                return cb(null, self.docToObject(count));
            } else {
                console.log(self._collectionName, 'update', Date.now() - now + 'ms', 'args=', e, count);
                return cb(null, null);
            }
        });
    });
};

module.exports = Module;
