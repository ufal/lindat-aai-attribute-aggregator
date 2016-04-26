/*
 * 
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global jQuery, window, document */
define(['utils', 'theme', 'jquery'], function (utils, theme, jQuery) {

    var name_map = {
        "urn:oid:0.9.2342.19200300.100.1.3":"mail",
        "urn:oid:1.2.840.113549.1.9.2":     "unstructuredName",
        "urn:oid:1.3.6.1.4.1.5923.1.1.1.1": "eduPersonAffiliation",
        "urn:oid:1.3.6.1.4.1.5923.1.1.1.3": "eduPersonOrgDN",
        "urn:oid:1.3.6.1.4.1.5923.1.1.1.4": "eduPersonOrgUnitDN",
        "urn:oid:1.3.6.1.4.1.5923.1.1.1.5": "eduPersonPrimaryAffiliation",
        "urn:oid:1.3.6.1.4.1.5923.1.1.1.6": "eduPersonPrincipalName",
        "urn:oid:1.3.6.1.4.1.5923.1.1.1.7": "eduPersonEntitlement",
        "urn:oid:1.3.6.1.4.1.5923.1.1.1.8": "eduPersonPrimaryOrgUnitDN",
        "urn:oid:1.3.6.1.4.1.5923.1.1.1.9": "eduPersonScopedAffiliation",
        "urn:oid:1.3.6.1.4.1.5923.1.1.1.10":"eduPersonTargetedID (aka persistentID)	",
        "urn:oid:1.3.6.1.4.1.25178.1.2.9":  "schacHomeOrganization",
        "urn:oid:2.5.4.3": "cn",
        "urn:oid:2.5.4.4": "surName",
        "urn:oid:2.5.4.10": "organizationName",
        "urn:oid:2.5.4.42": "givenName",
    };

    function Loginx() {
        this.met_refeds = "https://met.refeds.org/met/entity/{0}/?federation=edugain";
    }

    Loginx.prototype.list_loginx = function (obj_to_append) {
        var self = this;
        utils.simple_ajax(
            settings.backend.api.list,
            function(data) {
                var docs = data.result;
                for (var i=0; i<docs.length; ++i) {
                    var doc = docs[i];
                    var ts = doc.timestamp || doc.our_timestamp || "unknown";
                    ts = ts.toString().replace("T", " ").replace("Z", "");

                    var idp = theme.link(doc.idp, self.met_refeds.format(doc.idp));
                    var sp = theme.link(doc.sp, self.met_refeds.format(doc.sp));
                    var attributes_names = (doc.attributes || []).map(self.toname).sort();
                    var result_label = "label label-danger";
                    var result = "unknown";
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

                    obj_to_append.append(
                        theme.list_login_item(idp, sp, attributes_names, ts, result_label, result)
                    );
                }
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