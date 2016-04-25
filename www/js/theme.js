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

    Html.prototype.list_login_item = function (idp, sp, attributes, result) {
        var attributes_html = "";
        if (attributes) {
            for (var i = 0; i < attributes.length; ++i) {
                attributes_html += '<small class="text-muted">{0}</small> | '.format(attributes[i]);
            }
        }else {
            attributes_html = "MISSING!";
        }
        var result_label = "label label-danger";
        return ('<div class="row entry">' +
                '<div class="col-sm-10">' +
                    '<h3>{0} -> {1}</h3>' +
                    '<h4><span class="{2}">{3}</span></h4>' +
                    '<h4>|{4}</h4>' +
                '</div>' +
                '<div class="col-sm-2">' +
                    '<a href="#" class="pull-right"><img src="./images/idp.png" class="img-circle"></a>' +
                '</div>' +
            '</div>').format(idp, sp, result_label, result, attributes_html);
    };


    return new Html();
});