/*
 *
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global jQuery, window, document */
define(['entities', 'theme', 'utils', 'loginx', 'logger', 'jquery', 'bootstrap'],
    function(
        entities, theme, utils, loginx, logger, jQuery
    ) {

    function Site() {
    }

    var site = new Site();

    jQuery(document).ready(function () {

        // versions
        utils.simple_ajax(
            settings.backend.api.version,
            function(data) {
                jQuery(".version-back").each(function() {
                    jQuery(this).html("Backend: {0}".format(data.version));
                });
                jQuery(".version-entities-updated").each(function() {
                    jQuery(this).html("Entities updated: {0}".format(
                        data.entities_updated.replace("T", "").replace("Z", "")
                    ));
                });
            },
            function(xhr, status, error){
            }
        );

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
        jQuery(".list-nasty-idps").click(function() {
            loginx.clear();
            loginx.loading();
            theme.result_title("Nasty IdPs");
            loginx.list_loginx('q=-attributes:["" TO *]', function(idp, sp, doc, entry) {
                entry.parent().append('<div class="loading-freshness">{0} Checking freshness..</div>'.format(theme.loading_html(2)));
                entry.addClass('grayed-out');
                loginx.check_freshness(idp, sp, doc.timestamp, entry);
            });
        });

        //
        jQuery(".list-bad-idps").click(function() {
            loginx.clear();
            loginx.loading();
            theme.result_title("Bad IdPs");
            loginx.list_loginx('q=attributes_count:[1 TO 2]', function(idp, sp, doc, entry) {
                entry.parent().append('<div class="loading-freshness">{0} Checking freshness..</div>'.format(theme.loading_html(2)));
                entry.addClass('grayed-out');
                loginx.check_freshness(idp, sp, doc.timestamp, entry);
            });
        });

        //
        jQuery(".list-idps").click(function() {
            theme.result_title("Last Logins");
            loginx.loading();
            loginx.list_loginx();
        });

        // load the list
        jQuery(".list-idps").click();

        // hidden settings
        utils.simple_ajax(
            './settings/__settings.json',
            function(data) {
                if (data.doc_se) {
                    jQuery(".main-nav-links").append(
                        theme.nav_link(
                            '<i class="fa fa-file-excel-o" aria-hidden="true"></i> SENT EMAILS',
                            data.doc_se
                        )
                    )
                }
            },
            function(xhr, status, error){
            }
        );


    });

    return site;
});
