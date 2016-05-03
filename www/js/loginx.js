/*
 * 
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global jQuery, window, document */
define(['attributes', 'entities', 'utils', 'theme', 'jquery'], function (attributes, entities, utils, theme, jQuery) {

    function Loginx() {
        this.met_refeds = "https://met.refeds.org/met/entity/{0}/?federation=edugain";
    }

    Loginx.prototype.obj = function() {
        return jQuery("#list-logins");
    };

    Loginx.prototype.clear = function () {
        this.obj().html('');
    };

    Loginx.prototype.loading = function (start_loading) {
        if (false == start_loading) {
            this.obj().html('');
        }else {
            theme.loading(this.obj());
        }
    };

    Loginx.prototype.counts = function() {
        utils.simple_ajax(
            settings.backend.api.details,
            function(data) {
                var facets = data.result.facets;
                jQuery(".idp-count").html(theme.huge_text(facets.idp.length / 2));
                jQuery(".sp-count").html(theme.huge_text(facets.sp.length / 2));
                jQuery(".idpsp-count").html(theme.huge_text(facets.idpsp.length / 2));
                var idps = "";
                for (var i=0; i < facets.idp.length; i+=2) {
                    idps += theme.dict_entry(facets.idp[i], facets.idp[i+1]);
                }
                jQuery("#list-idps").html(idps);
                var sps = "";
                for (var i=0; i < facets.sp.length; i+=2) {
                    sps += theme.dict_entry(facets.sp[i], facets.sp[i+1]);
                }
                jQuery("#list-sps").html(sps);
            },
            function(xhr, status, error){
            }
        );
    };

    Loginx.prototype.check_freshness = function (idp, sp, timestamp, obj) {
        var loader = obj.parent().children().last();
        var params = 'q=idpsp:"{0}|{1}"'.format(idp, sp);
        utils.simple_ajax(
            settings.backend.api.list + "?" + utils.encodeUriSpecial(params),
            function(data) {
                loader.remove();
                try {
                    if (timestamp != data.result[0].timestamp) {
                        obj.children().last().fadeOut();
                        return;
                    }
                }catch(err){
                }
                obj.removeClass('grayed-out');
            },function(xhr, status, error){
            }
        );
    };

    Loginx.prototype.list_loginx = function (params, clb) {
        if (!params) {
            params = "";
        }
        var self = this;
        utils.simple_ajax(
            settings.backend.api.list + "?" + params,
            function(data) {
                self.loading(false);
                var docs = data.result;
                for (var i=0; i<docs.length; ++i) {
                    var doc = docs[i];
                    var ts = doc.timestamp || doc.our_timestamp || "unknown";
                    ts = ts.toString().replace("T", " ").replace("Z", "");

                    var idp = doc.idp;
                    var sp = doc.sp;
                    var attributes_names = (doc.attributes || []).map(attributes.name).sort();
                    var result_label = "label label-danger";
                    var result = '<i class="fa fa-3x fa-meh-o" aria-hidden="true"></i>';
                    var keys = Object.keys(settings.frontend.profile).sort();
                    for (var j=0; j < keys.length; ++j) {
                        var key = keys[j];
                        var fnc = settings.frontend.profile[key];
                        var res = fnc(attributes_names);
                        if (false !== res) {
                            result_label = key;
                            result = res;
                            break;
                        }
                    }

                    self.obj().append(
                        theme.list_login_item(
                            i + 1, idp, sp, attributes_names, ts, result_label, result
                        )
                    );
                    if (clb) {
                        clb(idp, sp, doc, self.obj().children().last());
                    }

                } // for

                entities.update();
            },
            function(xhr, status, error){
            }
        );
    };

    return new Loginx();
});