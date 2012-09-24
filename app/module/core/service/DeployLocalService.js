var _ = require('underscore')
  , fs = require('fs')
  , async = require('async')
  , less = require('less')
  , path = require('path')
  , util = require('util')
  , uglify = require('uglify-js')
  , app = require('')
  , config = app.getConfig()
;

// Constants
//----------------------------------------------------------------------------------------------------------------------
var CLIENT_JS_FILES = [
    {
        path: 'public/js/'
      , fileNames: [
            'json2'
          , 'plugins'
          , 'underscore'
          , 'backbone'
          , 'templates'
          , 'jquery.imagesloaded'
          , 'jquery.autogrow'
        ]
      , ext: '.js'
    }
  , {
        path: 'app/module/bootstrap/js'
      , fileNames: [
//            'bootstrap-transition'
//          , 'bootstrap-alert'
            'bootstrap-modal'
//          , 'bootstrap-dropdown'
//          , 'bootstrap-scrollspy'
//          , 'bootstrap-tab'
//          , 'bootstrap-tooltip'
//          , 'bootstrap-popover'
//          , 'bootstrap-button'
//          , 'bootstrap-collapse'
//          , 'bootstrap-carousel'
//          , 'bootstrap-typeahead'
        ]
      , ext: '.js'
    }
  , {
        path: 'app/module/layout/client'
      , fileNames: ['start', 'MiscModel', 'MiscView', 'LayoutView', 'BasePage']
      , ext: '.js'
    }
  , {
        path: 'app/module/user/client'
      , fileNames: ['UserRouter', 'UserModel', 'UserView']
      , ext: '.js'
    }
  , {
        path: 'app/module/layout/client'
      , fileNames: ['end']
      , ext: '.js'
    }
];

var TEMPLATE_FILES = [
    {
        path: 'app/module/company/template'
      , fileNames: ['company']
      , ext: '.html'
    }
  , {
        path: 'app/module/user/template'
      , fileNames: ['user']
      , ext: '.html'
    }
  , {
        path: 'app/module/layout/template'
      , fileNames: ['misc']
      , ext: '.html'
    }
];

// Constructor
//----------------------------------------------------------------------------------------------------------------------
var Module = function () {
};

// Prototype
//----------------------------------------------------------------------------------------------------------------------
Module.prototype._getLessOptions = function () {
    var options = {};
    if (config.isDevelopment()) {
        options.yuicompress = false;
    } else {
        options.yuicompress = true;
    }
    options.paths = [config.getPath('app/module/layout/style'), config.getPath('app/module/bootstrap/less')];
    return options;
};

Module.prototype._getFileNames = function (fileGroups) {
    var filePaths = [];
    for (var i = 0, ii = fileGroups.length; i < ii; ++i) {
        var fileGroup = fileGroups[i];
        var path = fileGroup.path;
        var fileNames = fileGroup.fileNames;
        var ext = fileGroup.ext;

        for (var j = 0, jj = fileNames.length; j < jj; ++j) {
            var fileName = fileNames[j];
            var filePath = config.getPath(path, fileName + ext);
            filePaths.push(filePath);
        }
    }
    return filePaths;
};

Module.prototype.genCSS = function (cb) {
    var fileName = config.getPath('app/module/layout/style', 'style.less');
    var file = fs.readFileSync(fileName, 'utf8');

    var options = this._getLessOptions();
    less.render(file, options, function(e, css) {
        if (e) {
            console.log(e);
            return cb(e);
        }
        if (options.yuicompress) {
            fs.writeFileSync(config.getPath('public/css/min/style.min.css'), css, 'utf8');
            fs.writeFileSync(config.getPath('public/css/style.css'), css, 'utf8');
        } else {
            fs.writeFileSync(config.getPath('public/css/style.css'), css, 'utf8');
        }
        return cb(null, css);
    });
};

Module.prototype.getClientJSFileNames = function () {
    return this._getFileNames(CLIENT_JS_FILES);
};

Module.prototype.getClientJSFiles = function () {
    var fileNames = this.getClientJSFileNames();
    var files = {};
    for (var i = 0, ii = fileNames.length; i < ii; ++i) {
        var fileName = fileNames[i];
        files[fileName] = fs.readFileSync(fileName, 'utf8');
    }
    return files;
};

Module.prototype.getTemplateFileNames = function () {
    return this._getFileNames(TEMPLATE_FILES);
};

Module.prototype.getTemplates = function () {
    var fileNames = this.getTemplateFileNames();
    var templates = [];
    for (var i = 0, ii = fileNames.length; i < ii; ++i) {
        var fileName = fileNames[i];
        var ns = path.basename(fileName, '.html');
        var temp = {};
        temp.ns = ns;
        temp.content = fs.readFileSync(fileName, 'utf8');

        var rawTemplates = temp.content.split('## ');
        temp.templates = _(rawTemplates).chain()
            .select(function (v) {
                return v.length > 0;
            })
            .map(function (v) {
                var i = v.indexOf('\n');
                var name = v.substring(0, i);
                var raw = v.substring(i + 1);
                return {
                    name: name
                  , raw: raw
                }
            })
            .value()
        ;
        templates.push(temp);
    }
    return templates;
};

Module.prototype.compressJS = function (rawJS) {
    var ast = uglify.parser.parse(rawJS); // parse code and get the initial AST
    ast = uglify.uglify.ast_mangle(ast); // get a new AST with mangled names
    ast = uglify.uglify.ast_squeeze(ast); // get an AST with compression optimizations
    var minimizedJS = uglify.uglify.gen_code(ast); // compressed code here
    return minimizedJS;
};

Module.prototype.genTemplates = function (cb) {
    var files = this.getTemplates();
    var templatesString = '';
    templatesString += 'app.templates = {\n';

    var line = [];
    _(files).each(function (file) {
        _(file.templates).each( function(v) {
            line.push('\'' + file.ns + '/' + v.name + '\': ' + JSON.stringify(v.raw));
        });
    });
    templatesString += line.join(',\n');
    templatesString += '};';

    fs.writeFileSync(config.getPath('public/js/templates.js'), templatesString, 'utf8');
    return cb(null, templatesString);
};

Module.prototype.genJS = function (cb) {
    var self = this;
    var fileNameToContentMap = {};
    var filePaths = this.getClientJSFileNames();

    //console.info(filePaths);
    async.forEach(filePaths, function (filePath, cb) {
        var stat = fs.statSync(filePath);
        fs.readFile(filePath, 'utf8', function (e, d) {
            if (e) {
                return cb(e);
            }
            fileNameToContentMap[filePath] = d;
            return cb(null, null);
        });
    }, function (e) {
        var allDataArr = [];
        // This is necessary to preserve order.
        _(filePaths).each(function(filePath) {
            allDataArr.push(fileNameToContentMap[filePath]);
        });

        //TODO: this contextWrap is from serverlocalService
        var allData = allDataArr.join('\n');
        allData = '(function (app) {\n\n' + allData + '\n\n})(__APP);';
        fs.writeFileSync(config.getPath('public/js/all.js'), allData, 'utf8');

        var allMinData = self.compressJS(allData);
        fs.writeFileSync(config.getPath('public/js/min/all.min.js'), allMinData, 'utf8');

        return cb(null, null);
    });
};

var instance = new Module();
module.exports = instance;
