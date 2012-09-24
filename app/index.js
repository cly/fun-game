var _ = require('underscore')
  , exec = require('child_process').exec
  , fs = require('fs')
  , util = require('util')
;

//TODO: Idea, maybe can hide the key conversion from the user... a layer will read json and do the key shortening

// Private
//----------------------------------------------------------------------------------------------------------------------
var _watchInterval = 1000;

// Constructor
//----------------------------------------------------------------------------------------------------------------------
var Module = function () {};

Module.prototype.init = function () {
    this.config = require('core/service/ConfigLocalService').init(process.env.SERVER_ENV);
    this.MongoDriver = require('driver/MongoDriver');
    this.setup = require('core/service/SetupLocalService');
    this.server = require('core/service/ServerLocalService');
    this.deploy = require('core/service/DeployLocalService');
    this.UserLocalService = require('user/service/UserLocalService');
};

// Prototype
//----------------------------------------------------------------------------------------------------------------------
Module.prototype._watchFiles = function (cb) {
    var self = this;
    exec('find ./app | egrep "\.js$|\.html$|\.less$"', function (error, stdout, stderr) {
        var fileNames = stdout.trim().split("\n");

        // First time watching.
        if (_.isUndefined(self._watchedFiles)) {
            console.info('Watching ' + fileNames.length + ' development files.');
            self._watchedFiles = [];
            fileNames.forEach(function (fileName) {
                self._watchedFiles.push(fileName);
                fs.watchFile(fileName, {interval : _watchInterval}, function (curr, prev) {
                    if (curr.mtime.valueOf() != prev.mtime.valueOf() || curr.ctime.valueOf() != prev.ctime.valueOf()) {
                        self._watchedFiles.forEach(function (fileName) {
                            fs.unwatchFile(fileName);
                        });
                        return cb(null, fileName);
                    }
                });
            });
            setTimeout(function () {
                self._watchFiles(cb);
            }, _watchInterval);
        } else {
            var newFiles = _(fileNames).difference(self._watchedFiles);
            var deletedFiles = _(self._watchedFiles).difference(fileNames);

            if (newFiles.length > 0 || deletedFiles.length > 0) {
                self._watchedFiles.forEach(function (fileName) {
                    fs.unwatchFile(fileName);
                });
                return cb(null, []);
            } else {
                setTimeout(function () {
                    self._watchFiles(cb);
                }, _watchInterval);
            }
        }
    });
};

Module.prototype.connectPersistence = function (cb) {
    return this.MongoDriver.getDbClient(cb);
};

Module.prototype.copyBootstrap = function () {
    return this.setup.copyBootstrap(function (e, d) {
        console.log('done copyBootstrap');
    });
};

Module.prototype.copyJSFiles = function () {
    this.setup.copyJSDependencies(function (e, d) {
        console.log('done copying');
    });
};

Module.prototype.dev = function () {
    var self = this;
    self.deploy.genCSS(function (e, d) {
        self.deploy.genTemplates(function (e, d) {
            self.deploy.genJS(function (e, d) {
                self.server.startServer(function (e, d) {
                    self._watchFiles(function (e, d) {
                        console.debug('Killing process because of changed file at ' + d);
                        process.exit(self.config.getExitCode());
                    });
                });
            });
        });
    });
};

Module.prototype.genCSS = function () {
    return this.deploy.genCSS(function (e, d) {
        console.log('done genCSS');
    });
};

Module.prototype.genJS = function () {
    return this.deploy.genJS(function (e, d) {
        console.log('done genJS');
    });
};

Module.prototype.getConfig = function () {
    return this.config;
};

Module.prototype.installDependencies = function () {
    return this.setup.installDependencies();
};

Module.prototype.startServer = function () {
    return this.server.startServer(function (e, d) {
    });
};

var instance = new Module();
module.exports = instance;
instance.init();

// Command Line APIs
//----------------------------------------------------------------------------------------------------------------------
if (process.argv.length > 2) {
    if (instance[process.argv[2]]) {
        var api = process.argv[2];
        var params = process.argv.slice(3);
        instance[api].apply(instance, params);
    } else {
        console.log('No such API:', process.argv[2]);
        console.log('Available APIs:');
        console.log(util.inspect(Module.prototype));
    }
}

