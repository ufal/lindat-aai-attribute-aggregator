/*
 *
 */

/*jslint nomen: true, unparam: true, regexp: true */
define([], function () {

    // Array Remove - By John Resig (MIT Licensed)
    Array.prototype.remove = function(from, to) {
        var rest = this.slice((to || from) + 1 || this.length);
        this.length = from < 0 ? this.length + from : from;
        return this.push.apply(this, rest);
    };

    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };

    String.prototype.contains = function(it) {
        return -1 != this.indexOf(it);
    };

    if (!String.prototype.format) {
        String.prototype.format = function() {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function(match, number) {
                return typeof args[number] != 'undefined'
                    ? args[number]
                    : match
                    ;
            });
        };
    }

    function Utils() {
    }

    Utils.prototype.simple_ajax = function( url_str, success_ftor, error_ftor, options ) {
        options = options || {};
        return jQuery.ajax({
            url: url_str,
            data: options["data"] || null,
            type: options["type"] || 'get',
            processData: false,
            crossDomain: true
        }).success(function (data) {
            success_ftor(data);
        }).error(function(xhr, status, error) {
            error_ftor(xhr, status, error);
        });
    };

    Utils.prototype.encodeUriSpecial = function(u) {
      return encodeURI(u).replace(/#/g, '%23');
    };

    return new Utils();

});