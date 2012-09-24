var _ = require('underscore')
;

// Constructor
//----------------------------------------------------------------------------------------------------------------------
var Module = function (collection) {
    this._collection = collection || [];
};

// Support all underscore collection and array methods.
// http://documentcloud.github.com/backbone/docs/backbone.html
var methods = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find', 'detect', 'filter', 'select', 'reject'
  , 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke', 'max', 'min', 'sortBy', 'sortedIndex', 'toArray'
  , 'size', 'first', 'initial', 'rest', 'last', 'without', 'indexOf', 'shuffle', 'lastIndexOf', 'isEmpty', 'groupBy'];

_.each(methods, function (method) {
    Module.prototype[method] = function() {
        return _[method].apply(_, [this._collection].concat(_.toArray(arguments)));
    };
});

// Prototype
//----------------------------------------------------------------------------------------------------------------------
Module.prototype.getCollection = function () {
    return this._collection;
};

Module.prototype.getElementById = function (id) {
    for (var i = 0, ii = this._collection.length; i < ii; ++i) {
        var element = this._collection[i];
        if (element.getId() === id) {
            return element;
        }
    }
    return null;
};

Module.prototype.hasElementById = function (id) {
    if (_.isNull(this.getElementById(id))) {
        return false;
    } else {
        return true;
    }
};

Module.prototype.pluck = Module.prototype.getOnlyFieldNameValues = function (fieldName) {
    var arr = [];
    for (var i = 0, ii = this._collection.length; i < ii; ++i) {
        var element = this._collection[i];
        if (element[fieldName]) {
            arr.push(element[fieldName]);
        }
    }
    return arr;
};

Module.prototype.getIds = function () {
    var ids = [];
    for (var i = 0, ii = this._collection.length; i < ii; ++i) {
        var element = this._collection[i];
        ids.push(element.getId());
    }
    return ids;
};

Module.prototype.push = function (element) {
    return this._collection.push(element);
};

Module.prototype.toJSON = function () {
    var json = [];
    for (var i = 0, ii = this._collection.length; i < ii; ++i) {
        var element = this._collection[i];
        json.push(element.toJSON());
    }
    return json;
};

module.exports = Module;
