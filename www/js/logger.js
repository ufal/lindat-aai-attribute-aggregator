/*
 * 
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global jQuery, window, document */
define(['jquery'], function (jQuery) {

    function Logger() {
        this.info("Logger initialised...")
    }

    Logger.prototype.time = function () {
        var d = new Date();
        var cur_hour = d.getHours();
        var cur_min = d.getMinutes();
        var cur_sec = d.getSeconds();
        return cur_hour + ':' + cur_min + '.' + cur_sec;
    };

    Logger.prototype.log = function(level, msg) {
        console.log(msg);
    };

    Logger.prototype.info = function(msg) {
        this.log('INFO', msg);
    };

    Logger.prototype.alert = function(msg) {
        this.log('ALERT', msg);
    };

    Logger.prototype.warn = function(msg) {
        this.log('WARN', msg);
    };

    Logger.prototype.error = function(msg, err) {
        this.log('ERRO', msg);
        if (err) {
            throw err;
        }
    };

    return new Logger();
});