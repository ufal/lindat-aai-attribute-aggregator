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
                attributes_html += '<li class="text-muted {0}">{0}</li>'.format(attributes[i]);
            }
        }else {
            attributes_html = "<li>MISSING!</li>";
        }
        attributes_html = '<ul class="entity-attributes">{0}</ul>'.format(attributes_html);

        var entity_info =
            '<hr><div class="entity-info-name" data-entity-attribute="displayName_en"></div>' +
            '<hr><div class="entity-contacts" data-entity-attribute="contacts"></div>' +
            '<hr><div class="entity-info-value entity-info-height-two" data-entity-attribute="displayDesc_en"><i class="fa fa-home" aria-hidden="true"></i> </div>' +
            '<hr><div class="entity-info-value" data-entity-attribute="registrationAuthority"><i class="fa fa-registered" aria-hidden="true"></i> Registrator: </div>' +
            '<hr><div class="entity-info-value" data-entity-attribute="entityAttributes"></div>' +
            '<hr><div class="entity-info-value" data-entity-attribute="requested_required"></div>'
        ;

        return ('<div class="row entry">' +
                '<div class="row">' +
                    '<div class="col-sm-2">' +
                        '<span class="label label-primary" style="margin-left:-30px; margin-right:10px">{6}</span>' +
                        '<span class="text-muted "><i class="fa fa-clock-o" aria-hidden="true"></i> {5}</span>' +
                    '</div>' +
                '</div>' +
                '<div class="row">' +
                    '<div class="col-sm-4" data-entity="{0}">' +
                        '<div class="text-right text-muted">' +
                            '<h5>{0} <i class="fa fa-university fa-2x"></i></h5>' +
                        '</div>' +
                        '<div class="text-center entity-info">{7}</div>' +
                    '</div>' +
                    '<div class="col-sm-3 aa-vs">' +
                        '<h4 class="text-center text-huge">vs.</h4>' +
                        '<div class="col-sm-12 {2} auth-result">' +
                            '{3}' +
                        '</div>' +
                        '<div class="col-sm-12">' +
                            '{4}' +
                        '</div>' +
                    '</div>' +
                    '<div class="col-sm-4 text-left" data-entity="{1}">' +
                        '<div class="text-left text-muted">' +
                            '<h5><i class="fa fa-cogs fa-2x"></i> {1}</h5>' +
                        '</div>' +
                        '<div class="text-center entity-info">' +
                            '<div class="text-center entity-info">{7}</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>').format(idp, sp, result_label, result, attributes_html, ts, pos, entity_info);
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

    Html.prototype.contact = function(email) {
        return '<div><a href="mailto:{0}"><i class="fa fa-envelope-o" aria-hidden="true"></i> {0}</a></div>'.format(email);
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