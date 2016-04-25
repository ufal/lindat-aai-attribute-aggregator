/*
 *
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global jQuery, window, document */
define(['theme', 'utils', 'loginx', 'logger', 'jquery', 'bootstrap'],
    function(
        theme, utils, loginx, logger, jQuery
    ) {

    function Site() {
    }

    var site = new Site();

    jQuery(document).ready(function () {

        jQuery("#list-logins").each(function() {
            loginx.list_loginx(jQuery("#list-logins"));
        });

        jQuery(".version-back").each(function() {
            var self = this;
            utils.simple_ajax(
                settings.backend.api.version,
                function(data) {
                    jQuery(self).html("Backend: {0}".format(data.version));
                },
                function(xhr, status, error){

                }
            );
        });

    });

    return site;
});
