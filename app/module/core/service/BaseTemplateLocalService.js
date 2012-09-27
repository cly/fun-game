var _ = require('underscore')
  , fs = require('fs')
;

// Constructor
//----------------------------------------------------------------------------------------------------------------------
var Module = function (templateFileName) {
    this._templateFileName = templateFileName;
    this._template = _.template(fs.readFileSync(this._templateFileName, 'utf8'));
};

// Prototype
//----------------------------------------------------------------------------------------------------------------------
Module.prototype.renderTemplate = function (data) {
    return this._template(data);
};

module.exports = Module;
