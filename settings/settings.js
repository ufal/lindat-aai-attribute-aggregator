/*
 *
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global $, window, document */

settings = {

    frontend: {
        auth: '/Shibboleth.sso/Session',

        howler: {
            subject: 'Attributes missing from [{0}]',
            body: 'Dear all,\n\n' +
            'there have been multiple attempts to access our service provider (SP) with the \n'+
            'entityID={0}\n'+
            'from users via your Identity Provider.\n'+
            'The service cannot work properly without mandatory attributes released.\n\n'+
            'The SP implements data protection code of conduct [1] and is a member of the CLARIN infrastructure.\n\n'+
            'Attributes released:\n{1}\n\n' +
            'Kind Regards,\n\n' +
            'XXX\n\n' +
            '[1] http://geant3plus.archive.geant.net/uri/dataprotection-code-of-conduct/V1/Pages/default.aspx\n' +
            '[2] http://clarin.eu and https://www.clarin.eu/content/service-provider-federation' +
            ''
        },
        
        profile: {
            "label label-success": function(d) {
                var at_least_one = [
                    "eduPersonPrincipalName",
                    "persistent-id",
                    "eduPersonTargetedID-persistentID"
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
            version: './aaggreg/version/',
            statistics: './aaggreg/v1/statistics/',
            idps: './aaggreg/v1/statistics/idps'
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
            spf_sp_feed: "https://infra.clarin.eu/aai/prod_md_about_spf_idps.xml",
            spf_homeless_feed: "https://infra.clarin.eu/aai/prod_md_about_clarin_erics_idp.xml"
        }
    }

};

// backend import
try {
    module.exports = settings;
}catch(err){
}