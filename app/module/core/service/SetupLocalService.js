var _ = require('underscore')
  , async = require('async')
  , fs = require('fs')
  , path = require('path')
  , spawn = require('child_process').spawn
  , app = require('')
  , config = app.getConfig()
;

// Private
//----------------------------------------------------------------------------------------------------------------------
var _copy = function (src, dst, cb) {
    var proc = spawn('cp', ['-R', src, dst]);

    proc.stdout.on('data', function (data) {
        console.log('' + data);
    });

    proc.stderr.on('data', function (data) {
        console.log((new Error()).stack);
        console.log('' + data);
        return cb(data);
    });

    proc.on('exit', function (code) {
        return cb(null, null);
    });
};

var _copyAndChmod = function (src, dst, cb) {
    _copy(src, dst, function (e, d) {
        if (e) {
            return cb(e);
        }
        fs.chmodSync(dst, '644');
        return cb(null, null);
    });
};

var _copyRule = function (pkg, cb) {
    var rule = _getCopyRule(pkg);
    _copyAndChmod(rule.src, rule.dst, cb);
};

var _copyRules = [
    {
        name: 'modernizr'
      , src: config.getPath('submodules/html5-boilerplate/js/libs/modernizr-2.5.2.min.js')
      , dst: config.getPath('public/js/min/modernizr.min.js')
    }
  , {
        name: 'jquery'
      , src: config.getPath('submodules/html5-boilerplate/js/libs/jquery-1.7.1.js')
      , dst: config.getPath('public/js/jquery.js')
    }
  , {
        name: 'jquery.min'
      , src: config.getPath('submodules/html5-boilerplate/js/libs/jquery-1.7.1.min.js')
      , dst: config.getPath('public/js/min/jquery.min.js')
    }
  , {
        name: 'underscore'
      , src: config.getPath('node_modules/underscore/underscore.js')
      , dst: config.getPath('public/js/underscore.js')
    }
  , {
        name: 'plugins'
      , src: config.getPath('submodules/html5-boilerplate/js/plugins.js')
      , dst: config.getPath('public/js/plugins.js')
    }
  , {
        name: 'backbone'
      , src: config.getPath('node_modules/backbone/backbone.js')
      , dst: config.getPath('public/js/backbone.js')
    }
];

var _nameToRulesMap = {};
_(_copyRules).each(function (rule) {
    _nameToRulesMap[rule.name] = rule;
});

var _getCopyRule = function (name) {
    return _nameToRulesMap[name];
};

// Constructor
//----------------------------------------------------------------------------------------------------------------------
var Module = function () {
    this.globalNPMDependencies = ['n@0.6.1', 'uglify-js@1.2.5'];
    this.globalGemDependencies = ['watchr'];
};

// Prototype
//----------------------------------------------------------------------------------------------------------------------
Module.prototype._installNPMDependency = function (dependencies, cb) {
    var self = this;
    if (dependencies.length == 0) {
        return cb(null, null);
    } else {
        var dependency = dependencies.shift();
        var proc = spawn('npm', ['install', '-g', dependency]);
        proc.stdout.on('data', function (data) {
            console.log('stdout: ' + data);
        });

        proc.stderr.on('data', function (data) {
            console.log('stderr: ' + data);
            console.log((new Error()).stack);
            process.exit();
        });

        proc.on('exit', function (code) {
            self._installNPMDependency(dependencies, cb);
        });
    }
};

Module.prototype._installGemDependency = function (dependencies, cb) {
    var self = this;
    if (dependencies.length == 0) {
        return cb(null, null);
    } else {
        var dependency = dependencies.shift();
        var proc = spawn('gem', ['install', dependency]);
        proc.stdout.on('data', function (data) {
            console.log('stdout: ' + data);
        });

        proc.stderr.on('data', function (data) {
            console.log('stderr: ' + data);
            console.log((new Error()).stack);
            process.exit();
        });

        proc.on('exit', function (code) {
            self._installGemDependency(dependencies, cb);
        });
    }
};

Module.prototype.installDependencies = function () {
    var self = this;
    self._installNPMDependency(_(self.globalNPMDependencies).clone(), function (e, d) {
        console.log('Installed all npm dependencies.');
        self._installGemDependency(_(self.globalGemDependencies).clone(), function (e, d) {
            console.log('Installed all gem dependencies.');
        });
    });
};

// Copies necessary bootstrap files from twitter-bootstrap module to our application.
Module.prototype.copyBootstrap = function (cb) {
    var fromDir = config.getPath('submodules/bootstrap');
    var toDir = config.getPath('app/module/bootstrap');

    _copy(path.join(fromDir, 'less'), toDir, function (e, d) {
        if (e) {
            return cb(e);
        }
        _copy(path.join(fromDir, 'js'), toDir, function (e, d) {
            if (e) {
                return cb(e);
            }
            return cb(null, d);
        });
    });
};

Module.prototype.copyJSDependencies = function (cb) {
    async.forEach(_copyRules, function (rule, cb) {
        console.log('copying ' + rule.name);
        _copyRule(rule.name, cb);
    }, function (e, d) {
        if (e) {
            return cb(e);
        } else {
            return cb(null, null);
        }
    });
};

Module.prototype.copyJSDependency = function (name, cb) {
    _copyRule(rule.name, cb);
};

var instance = new Module();
module.exports = instance;
