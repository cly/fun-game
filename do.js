var _ = require('underscore')
  , config = require('./app/module/core/service/ConfigLocalService').init(process.env.SERVER_ENV)
  , spawn = require('child_process').spawn
;

var options = {
    cwd: undefined
  , env: _(process.env).extend(config.getProcessEnv())
  , setsid: false
};

var Module = function () {};

Module.prototype.init = function (method, args) {
    var self = this;
    var name = 'node'
    var params = ['app'].concat(method).concat(args);
    var proc = spawn(name, params, options);

    proc.stdout.on('data', function (data) {
        console.log('' + data);
    });

    proc.stderr.on('data', function (data) {
        console.log('' + data);
    });

    proc.on('exit', function (code) {
        console.log('proc `' + name + ' ' + params.join(' ') + '` exited with code ' + code);
        if (code === config.getExitCode()) {
            self.init(method);
        }
    });
};

var instance = new Module();

// Command Line APIs
//----------------------------------------------------------------------------------------------------------------------
if (process.argv.length > 1) {
    var method = process.argv[2];
    var args = Array.prototype.slice.call(process.argv, 3);
    instance.init(method, args);
}
