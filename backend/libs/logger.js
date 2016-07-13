// utils
//
var winston = require('winston');

module.exports = function(module_name) {

    var logger = new (winston.Logger)({
        "exitOnError" : true,
        "transports" : [
            new (winston.transports.Console)({
                "colorize" : true,
                "level" : "info",
                "silent" : false,
                "handleExceptions" : false
            })
        ]
    });

    logger.log = function(){
        if (module_name) {
            arguments[1] = "[" + module_name + "]" + " " + arguments[1]; // jshint ignore:line
        }
        winston.Logger.prototype.log.apply(this, arguments);
    };

    return logger;
};