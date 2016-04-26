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

    Html.prototype.list_login_item = function (pos, idp, sp, attributes, ts, result_label, result) {
        var attributes_html = "";
        if (attributes) {
            for (var i = 0; i < attributes.length; ++i) {
                attributes_html += '<h5 class="text-muted">{0}</h5>'.format(attributes[i]);
            }
        }else {
            attributes_html = "MISSING!";
        }
        return ('<div class="row entry">' +
                '<div class="col-sm-2">' +
                    '<span class="label label-primary" style="margin-left:-30px; margin-right:10px">{6}</span>' +
                    '<span class="text-muted "><i class="fa fa-clock-o" aria-hidden="true"></i> {5}</span>' +
                    '<a href="#" class=""><img src="./images/idp.png" class="img-thumbnail"></a>' +
                '</div>' +
                '<div class="col-sm-1 {2}" style="margin-top: 40px;">' +
                    '{3}' +
                '</div>' +
                '<div class="col-sm-9">' +
                    '<h4>{0} <i class="fa fa-sign-in text-muted" aria-hidden="true"></i> {1}</h4>' +
                    '{4}' +
                '</div>' +
            '</div>').format(idp, sp, result_label, result, attributes_html, ts, pos);
    };

    Html.prototype.link = function(text, href) {
      return '<a href="{0}">{1}</a>'.format(href, text);
    };

    Html.prototype.loading_html = function() {
        return '<i class="fa fa-cog fa-spin fa-3x fa-fw margin-bottom"></i>';
    };

    Html.prototype.loading = function(obj) {
        obj.append(this.loading_html());
    };
    
    Html.prototype.user = function(name) {
        return '<i class="fa fa-2x fa-user-md" aria-hidden="true"></i> ' + name;
    };

    Html.prototype.result_title = function(name) {
        jQuery("#result-title").html(name);
    };

    Html.prototype.huge_text = function(text) {
        return '<div class="text-huge">{0}</div>'.format(text);
    };

    Html.prototype.dict_entry = function(key, value) {
        return '<div>{0}: <span class="badge">{1}</span></div>'.format(key, value);
    };

    var html = new Html();
    jQuery(document).ready(function () {

        jQuery(".loading").each(function() {
            html.loading(jQuery(this));
        });
    });

    return html;
});