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

        jQuery(".idp-count").each(function() {
            theme.loading(jQuery(this));
        });
        jQuery(".sp-count").each(function() {
            theme.loading(jQuery(this));
        });
        loginx.counts();

        jQuery(".toggle-data-target").each(function() {
            var idstr = jQuery(this).attr("data-target");
            jQuery(this).click(function() {
                jQuery("#"+idstr).toggle();
            });
        });


        jQuery(".set-data-url").each(function() {
            var s = jQuery(this).attr("data-url-target");
            var url = settings.frontend[s];
            jQuery(this).attr("href", url);
        });

        // this is a bit crazy! but rather than php dependency
        jQuery(".user-info").each(function() {
            var self = this;
            utils.simple_ajax(
                settings.frontend.auth,
                function(html) {
                    var match = /.*eppn.*:\s*(.+)/.exec(html);
                    if (match) {
                        jQuery(".user-info").html(theme.user(match[1]));
                    }
                },
                function(xhr, status, error){
                }
            );
        });

        //
        jQuery(".list-bad-idps").click(function() {
            loginx.clear();
            loginx.loading();
            theme.result_title("Bad IdPs");
            loginx.list_loginx('q=-attributes:["" TO *]');
            return false;
        });

        //
        jQuery(".list-idps").click(function() {
            theme.result_title("Last Logins");
            loginx.loading();
            loginx.list_loginx();
            return false;
        });

        // load the list
        jQuery(".list-idps").click();

    });

    return site;
});
