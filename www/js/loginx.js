/*
 * 
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global jQuery, window, document */
define(['utils', 'theme', 'jquery'], function (utils, theme, jQuery) {

    function Loginx() {
    }

    Loginx.prototype.list_loginx = function (obj_to_append) {
        utils.simple_ajax(
            settings.backend.api.list,
            function(data) {
                var docs = data.result;
                for (var i=0; i<docs.length; ++i) {
                    var doc = docs[i];
                    obj_to_append.append(
                        theme.list_login_item(doc.idp, doc.sp, doc.attributes, "...")
                    );
                }
            },
            function(xhr, status, error){

            }
        );
    };


    return new Loginx();
});