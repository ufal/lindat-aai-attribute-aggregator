/*
 * 
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global jQuery, window, document */
define([], function () {

    var name_map = {
        "urn:oid:0.9.2342.19200300.100.1.3":"mail",
        "urn:oid:1.2.840.113549.1.9.1":     "mail urn-email",
        "urn:mace:dir:attribute-def:mail":  "mail urn-mace",

        "urn:oid:1.2.840.113549.1.9.2":     "unstructuredName",
        "urn:oid:1.3.6.1.4.1.5923.1.1.1.1": "eduPersonAffiliation",
        "urn:oid:1.3.6.1.4.1.5923.1.1.1.3": "eduPersonOrgDN",
        "urn:oid:1.3.6.1.4.1.5923.1.1.1.4": "eduPersonOrgUnitDN",
        "urn:oid:1.3.6.1.4.1.5923.1.1.1.5": "eduPersonPrimaryAffiliation",

        "urn:oid:1.3.6.1.4.1.5923.1.1.1.6": "eduPersonPrincipalName",
        "urn:mace:dir:attribute-def:eduPersonPrincipalName": "eduPersonPrincipalName urn-mace",

        "urn:oid:1.3.6.1.4.1.5923.1.1.1.7": "eduPersonEntitlement",
        "urn:oid:1.3.6.1.4.1.5923.1.1.1.8": "eduPersonPrimaryOrgUnitDN",

        "urn:oid:1.3.6.1.4.1.5923.1.1.1.9": "eduPersonScopedAffiliation",
        "urn:mace:dir:attribute-def:eduPersonScopedAffiliation": "eduPersonScopedAffiliation urn-mace",

        "urn:oid:1.3.6.1.4.1.5923.1.1.1.10":"eduPersonTargetedID-persistentID",
        "urn:oid:1.3.6.1.4.1.25178.1.2.9":  "schacHomeOrganization",

        "urn:oid:2.5.4.3":                  "cn",
        "urn:mace:dir:attribute-def:cn":    "cn urn-mace",

        "urn:oid:2.5.4.4":                  "surName",
        "urn:mace:dir:attribute-def:sn":    "surName urn-mace",

        "urn:oid:2.5.4.10":                 "organizationName",
        "urn:oid:2.5.4.42":                 "givenName",
        "urn:mace:dir:attribute-def:givenName": "givenName urn-mace",
    };

    function Attributes() {
    }

    Attributes.prototype.name = function(urn) {
        return name_map[urn] || urn;
    };


    return new Attributes();
});