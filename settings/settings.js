/*
 *
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global $, window, document */

settings = {

    backend: {
        api: {
            list: '/aaggreg/v1/list/',
            version: '/aaggreg/version/',
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