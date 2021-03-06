/*
 * 
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global jQuery, window, document */
define(['attributes', 'utils', 'theme', 'jquery'], function (attributes, utils, theme, jQuery) {

    function Entities() {
        this.d = {};
    }

    Entities.prototype.entity = function(entityID, clb) {
        var self = this;
        if (this.d.hasOwnProperty(entityID)) {
            return clb(entityID, this.d[entityID]);
        }
        // fetch it
        var url = settings.backend.api.entity + '?entityID=' + utils.encodeUriSpecial(entityID);
        console.log(url);
        utils.simple_ajax(
            url,
            function(data) {
                self.d[entityID] = data["result"][0];
                return clb(entityID, self.d[entityID]);
            },
            function(xhr, status, error){
            }
        );
        
    };

    Entities.prototype.update_element = function(entityID, entity_obj, o, entityID_other, released_attrs) {
        // we use this function from two data sources, one has arrays for each attribute and one does not
        function _get_value(o) {
            return Array.isArray(o) ? o[0] : o;
        }
        function _get_values(o) {
            return Array.isArray(o) ? o.join("<br>") : o;
        }

        if (!entity_obj) {
            return;
        }
        var attr = o.attr("data-entity-attribute");
        var entity_type = entity_obj.type;
        if (entity_obj.hasOwnProperty("type")) {
            entity_type = entity_obj.type[0];
        }
        switch(attr) {
            case 'displayName_en':
                var html = "";
                if (entity_obj.logo) {
                    var logo_url = _get_value(entity_obj.logo);
                    html += '<img src="{0}" alt="{1}"> '.format(logo_url, entityID);
                }
                if (entity_obj.hasOwnProperty(attr)) {
                    html += ' <span>{0}</span>'.format(_get_value(entity_obj[attr]));
                }
                o.append("<h4>{0}</h4>".format(html));
                break;

            case 'contacts':
                var whom_to_send = {};
                if (entity_obj.hasOwnProperty("emails")) {
                    var contacts = entity_obj["emails"];
                    for (var key in contacts) {
                        if (contacts.hasOwnProperty(key)) {
                            o.append(theme.contact(
                                contacts[key],
                                '<span class="label label-default">{0}</span> {1}'.format(key, contacts[key])
                            ));
                        }
                    }

                }else {
                    for (var key in entity_obj) {
                        if (entity_obj.hasOwnProperty(key)) {
                            if (key.startsWith("email_")) {
                                var ekey = key.substr(6);
                                var email = _get_value(entity_obj[key]);
                                if (email) {
                                    whom_to_send[email] = 0;
                                    if (ekey === "technical" || ekey === "administrative") {
                                        whom_to_send[email] += 1;
                                    }
                                    o.append(theme.contact(
                                        email,
                                        '<span class="label label-default">{0}</span> {1}'.format(ekey, email)
                                    ));
                                }
                            }
                        }
                    }
                }
                //
                if ("idp" === entity_type) {
                    var msg = settings.frontend.howler.body.format(entityID_other, released_attrs);
                    var entity_obj_other = this.d[entityID_other];
                    var email_cc = "";
                    try {
                        email_cc = entity_obj_other.email_administrative || entity_obj_other.email_technical;
                    }catch(err){
                    }
                    var subject = settings.frontend.howler.subject.format(entityID);
                    for (var email in whom_to_send) {
                        if (!whom_to_send.hasOwnProperty(email)) {
                            continue;
                        }
                        var send_howler = theme.howler(
                            subject,
                            email,
                            'Send a howler to {0}'.format(email),
                            msg,
                            email_cc
                        );
                        o.append(send_howler);
                    }
                }

                break;

            case 'requested_required':
                if (entity_obj.hasOwnProperty(attr)) {
                    var values = entity_obj[attr];
                    var html = "";
                    for (var i=0; i < values.length; ++i) {
                        var value = values[i];
                        var j = value.lastIndexOf("_");
                        var mandatory = value.substring(j + 1) === "true";
                        value = attributes.name(value.substring(0, j));
                        html += '<li>{1} {0}</li>'.format(
                                value, mandatory ? theme.mandatory("mandatory") : theme.optional("optional")
                        );
                    }
                    o.html('<ul class="attributes">{0}</ul>'.format(html));
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

            case 'feeds':
                if (entity_obj.hasOwnProperty(attr)) {
                    var values = entity_obj[attr];
                    html = '<div style="min-height: 25px">Feeds: ';
                    for (var i=0; i < values.length; ++i) {
                        var value = values[i];
                        html += '<span class="label label-primary">{0}</span>'.format(value);
                    }
                    html += '</div>';
                    o.append(html);
                }
                break;

            case 'registrationAuthority':
                if (entity_obj.hasOwnProperty(attr)) {
                    var html = _get_values(entity_obj[attr]);
                    if (entity_obj.hasOwnProperty("registrationAuthorityDate")) {
                        html += ' ({0})'.format(entity_obj["registrationAuthorityDate"]);
                    }
                    o.append(html);
                }
                break;

            default:
                if (entity_obj.hasOwnProperty(attr)) {
                    var vals = _get_values(entity_obj[attr]);
                    if (o.children()
                            && 1 === o.children().length
                                && o.children().first().prop("tagName") !== "I")
                    {
                        o.children().first().append(vals);
                    }else {
                        o.append(vals);
                    }
                }
        }
    };

    Entities.prototype.assign = function(entities, clb) {
        var d = { done: 0 };

        function ftor() {
            d["done"] += 1;
            if (d["done"] === entities.length) {
                clb();
            }
        }

        for (var i = 0; i < entities.length; ++i) {
            this.entity(entities[i], ftor);
        }
    };

    Entities.prototype.update = function() {
        // var idp = theme.link(doc.idp, self.met_refeds.format(doc.idp));
        // var sp = theme.link(doc.sp, self.met_refeds.format(doc.sp));

        var self = this;
        var entities = {};
        jQuery("[data-entity-attribute]").each(function() {
            var this_o = jQuery(this);
            var o = jQuery(this);
            while (o) {
                var entityID = o.attr("data-entity");
                if (entityID) {
                    entities[entityID] = o.attr("data-type");
                    break;
                }
                o = o.parent();
            }
        });

        // fetch them and update them
        this.assign(Object.keys(entities), function() {
            jQuery("[data-entity-attribute]").each(function () {
                var this_o = jQuery(this);
                var o = jQuery(this);
                while (o) {
                    var entityID = o.attr("data-entity");
                    if (entityID) {
                        var entityID_other = o.attr("data-entity-brother");
                        var ent = self.d[entityID];
                        var released_attrs = [];
                        /*jshint -W083 */
                        jQuery("li", o.next().find(".entity-attributes")).each(function() {
                            released_attrs.push(jQuery(this).text());
                        });
                        self.update_element(entityID, ent, this_o, entityID_other, released_attrs.join("\n"));
                        break;
                    }
                    o = o.parent();
                }
            });
        });
    };

    return new Entities();
});