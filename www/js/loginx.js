/*
 * 
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global jQuery, window, document */
define(['entities', 'utils', 'theme', 'jquery'], function (entities, utils, theme, jQuery) {

    var name_map = {
        "urn:oid:0.9.2342.19200300.100.1.3":"mail",
        "urn:oid:1.2.840.113549.1.9.1":     "mail",
        "urn:oid:1.2.840.113549.1.9.2":     "unstructuredName",
        "urn:oid:1.3.6.1.4.1.5923.1.1.1.1": "eduPersonAffiliation",
        "urn:oid:1.3.6.1.4.1.5923.1.1.1.3": "eduPersonOrgDN",
        "urn:oid:1.3.6.1.4.1.5923.1.1.1.4": "eduPersonOrgUnitDN",
        "urn:oid:1.3.6.1.4.1.5923.1.1.1.5": "eduPersonPrimaryAffiliation",
        "urn:oid:1.3.6.1.4.1.5923.1.1.1.6": "eduPersonPrincipalName",
        "urn:oid:1.3.6.1.4.1.5923.1.1.1.7": "eduPersonEntitlement",
        "urn:oid:1.3.6.1.4.1.5923.1.1.1.8": "eduPersonPrimaryOrgUnitDN",
        "urn:oid:1.3.6.1.4.1.5923.1.1.1.9": "eduPersonScopedAffiliation",
        "urn:oid:1.3.6.1.4.1.5923.1.1.1.10":"eduPersonTargetedID-persistentID",
        "urn:oid:1.3.6.1.4.1.25178.1.2.9":  "schacHomeOrganization",
        "urn:oid:2.5.4.3":                  "cn",
        "urn:oid:2.5.4.4":                  "surName",
        "urn:oid:2.5.4.10":                 "organizationName",
        "urn:oid:2.5.4.42":                 "givenName",
    };

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

    Loginx.prototype.list_loginx = function (params) {
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
                    var attributes_names = (doc.attributes || []).map(self.toname).sort();
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
                } // for

                entities.update();
            },
            function(xhr, status, error){

            }
        );
    };

    Loginx.prototype.toname = function(urn) {
        return name_map[urn] || urn;
    };


    return new Loginx();
});