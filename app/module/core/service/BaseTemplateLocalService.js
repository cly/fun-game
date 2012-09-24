var _ = require('underscore')
  , fs = require('fs')
;

// Constructor
//----------------------------------------------------------------------------------------------------------------------
var Module = function (templateFileName) {
    this.templateFileName = templateFileName;
    this.template = _.template(fs.readFileSync(this.templateFileName, 'utf8'));
};

// Prototype
//----------------------------------------------------------------------------------------------------------------------
Module.prototype.getTemplate = function () {
    return this.template;
};

module.exports = Module;
