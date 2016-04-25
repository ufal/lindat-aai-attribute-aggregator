/*
 * 
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global jQuery, window, document */
define(['utils', 'jquery'], function (utils, jQuery) {


    function Html() {
        this.pallete = [
            "#588C7E",
            "#F2E394",
            "#F2AE72",
            "#D96459",
            "#8C4646",
            "#64E8F4",
            "#666259",
            "#89714D",
            "#160F08",
            "#644516",
        ];
    }

    Html.prototype.list_login_item = function (idp, sp, attributes, ts, result) {
        var attributes_html = "";
        if (attributes) {
            for (var i = 0; i < attributes.length; ++i) {
                attributes_html += '<h5 class="text-muted">{0}</h5>'.format(attributes[i]);
            }
        }else {
            attributes_html = "MISSING!";
        }
        var result_label = "label label-danger";
        return ('<div class="row entry">' +
                '<div class="col-sm-10">' +
                    '<span class="text-muted pull-right"><i class="fa fa-clock-o" aria-hidden="true"></i> {5}</span>' +
                    '<h3>{0} <i class="fa fa-sign-in text-muted" aria-hidden="true"></i> {1}</h3>' +
                    '<h4><span class="{2}">{3}</span></h4>' +
                    '{4}' +
                '</div>' +
                '<div class="col-sm-2">' +
                    '<a href="#" class="pull-right"><img src="./images/idp.png" class="img-circle"></a>' +
                '</div>' +
            '</div>').format(idp, sp, result_label, result, attributes_html, ts);
    };

    Html.prototype.link = function(text, href) {
      return '<a href="{0}">{1}</a>'.format(href, text);
    };

    Html.prototype.loading_html = function(obj) {
        return '<i class="fa fa-cog fa-spin fa-3x fa-fw margin-bottom"></i>';
    };

    Html.prototype.loading = function(obj) {
        obj.append(this.loading_html());
    };

    var html = new Html();
    jQuery(document).ready(function () {

        jQuery(".loading").each(function() {
            html.loading(jQuery(this));
        });
    });

    return html;
});