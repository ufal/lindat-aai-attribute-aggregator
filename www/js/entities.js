/*
 * 
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global jQuery, window, document */
define(['utils', 'theme', 'jquery'], function (utils, theme, jQuery) {

    function Entities() {
        this.d = {};
    }

    Entities.prototype.entity = function(entityID, clb) {
        var self = this;
        if (this.d.hasOwnProperty(entityID)) {
            return clb(this.d[entityID]);
        }
        // fetch it
        var url = settings.backend.api.entity + '?entityID=' + entityID;
        utils.simple_ajax(
            url,
            function(data) {
                self.d[entityID] = data["result"][0];
                return clb(self.d[entityID]);
            },
            function(xhr, status, error){
            }
        );
        
    };

    Entities.prototype.update_element = function(entityID, entity_obj, o) {
        if (!entity_obj) {
            return;
        }
        var attr = o.attr("data-entity-attribute");
        switch(attr) {
            case 'displayName_en':
                var html = "";
                if (entity_obj.logo) {
                    var logo_url = entity_obj.logo[0];
                    html += '<img src="{0}" alt="{1}"> '.format(logo_url, entityID);
                }
                if (entity_obj.hasOwnProperty(attr)) {
                    html += ' <span>{0}</span>'.format(entity_obj[attr].join("<br>"));
                }
                o.append("<h4>{0}</h4>".format(html));
                break;

            case 'contacts':
                for (var key in entity_obj) {
                    if (entity_obj.hasOwnProperty(key)) {
                        if (key.startsWith("email_")) {
                            o.append(theme.contact(entity_obj[key][0]));
                        }
                    }
                }
                break;

            case 'requested_required':
                if (entity_obj.hasOwnProperty(attr)) {
                    var values = entity_obj[attr];
                    for (var i=0; i < values.length; ++i) {
                        var value = values[i];
                        var j = value.lastIndexOf("_");
                        var mandatory = value.substring(j + 1) == "true";
                        value = value.substring(0, j);
                        o.append(
                            "<div>{0} : <strong>{1}</strong></div>".format(
                                value, mandatory ? theme.mandatory("mandatory") : "optional"
                            )
                        );
                    }
                }
                break;

            case 'entityAttributes':
                if (entity_obj.hasOwnProperty(attr)) {
                    var values = entity_obj[attr];
                    for (var i=0; i < values.length; ++i) {
                        var value = values[i];
                        html = '<div style="min-height: 25px"><span class="label label-success">{0}</span></div>'.format(value);
                        o.append(html);
                    }
                }
                break;

            default:
                if (entity_obj.hasOwnProperty(attr)) {
                    if (o.children() && 1 == o.children().length && o.children().first().prop("tagName") !== "I") {
                        o.children().first().append(entity_obj[attr].join("<br>"));
                    }else {
                        o.append(entity_obj[attr].join("<br>"));
                    }
                }
        }
    };

    Entities.prototype.update = function() {
        // var idp = theme.link(doc.idp, self.met_refeds.format(doc.idp));
        // var sp = theme.link(doc.sp, self.met_refeds.format(doc.sp));

        var self = this;
        jQuery("[data-entity-attribute]").each(function() {
            var this_o = jQuery(this);
            var o = jQuery(this);
            while (o) {
                var entityID = o.attr("data-entity");
                if (entityID) {
                    self.entity(entityID, function(entity_obj) {
                        self.update_element(entityID, entity_obj, this_o)
                    });
                    break;
                }
                o = o.parent();
            }
        });
    };

    return new Entities();
});