var _ = require('underscore')
  , util = require('util')
  , BaseCollection = require('core/model/BaseCollection')
;

// Constructor
//----------------------------------------------------------------------------------------------------------------------
var Module = function (collection) {
    BaseCollection.call(this, collection);
};
util.inherits(Module, BaseCollection);

module.exports = Module;
