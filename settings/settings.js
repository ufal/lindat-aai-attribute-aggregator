/*
 *
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global $, window, document */

settings = {

    frontend: {
        auth: '/Shibboleth.sso/Session',
        
        profile: {
            "label label-success": function(d) {
                var at_least_one = [
                    "eduPersonPrincipalName"
                ];
                for (var i=0; i < at_least_one.length; ++i) {
                    if (-1 != d.indexOf(at_least_one[i])) {
                        return '<div><i class="fa fa-4x fa-smile-o" aria-hidden="true"></i></div>ID (kind-of) friendly';
                    }
                }
                return false;
            }
        }

    },

    backend: {
        api: {
            list: './aaggreg/v1/list/',
            details: './aaggreg/v1/details/',
            entity: './aaggreg/v1/entity/',
            version: './aaggreg/version/'
        },

        authenticate_saml: {

        },

        temp_dir: "./temp",

        solr_port: 8983,
        solr_host: "localhost",
        solr_loginx_core: "loginx",
        solr_entities_core: "entities",
        feeds: {
            edugain_feed: "http://mds.edugain.org/",
            spf_idp_feed: "https://infra.clarin.eu/aai/prod_md_about_spf_sps.xml",
            spf_sp_feed: "https://infra.clarin.eu/aai/prod_md_about_spf_idps.xml"
        }
    }

};

// backend import
try {
    module.exports = settings;
}catch(err){
}