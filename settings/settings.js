/*
 *
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global $, window, document */

settings = {

    frontend: {
        auth: '/Shibboleth.SSO/Session',
        
        profile: {
            "label label-success": function(d) {
                var at_least_one = [
                    "eduPersonPrincipalName"
                ];
                for (var i=0; i < at_least_one.length; ++i) {
                    if (d.hasOwnProperty(at_least_one[i])) {
                        return "ID (kind-of) friendly";
                    }
                }
                return false;
            }
        }

    },

    backend: {
        api: {
            list: './aaggreg/v1/list/',
            version: './aaggreg/version/',
        },

        authenticate_saml: {

        },

        solr_port: 8983,
        solr_host: "localhost",
        solr_core: "loginx",
        spf: {
            idp_feed: "https://infra.clarin.eu/aai/prod_md_about_spf_sps.xml",
            sp_feed: "https://infra.clarin.eu/aai/prod_md_about_spf_idps.xml"
        }
    }

};

// backend import
try {
    module.exports = settings;
}catch(err){
}