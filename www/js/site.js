/*
 *
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global jQuery, window, document */
define(['loginx', 'logger', 'jquery', 'bootstrap'],
    function(
        loginx, logger, jQuery
    ) {

    function Site() {
    }

    var site = new Site();

    jQuery(document).ready(function () {

        jQuery("#list-logins").each(function() {
            loginx.list_loginx(jQuery("#list-logins"));
        });
    });

    return site;
});
