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
            body: 'To whom it may concern:\n\n' +
            'On behalf of one of the Service Providers from CLARIN Service Provider Federation (SPF) [1] \n'+
            'we would like to inform you that users from your home organisation tried to access a protected\n'+
            'service or resource but were unable to do so because your Identity Provider has not released\n'+
            'all the mandatory attributes.\n\n'+
            'All the Service Providers in the CLARIN SPF are:\n'+
            '1) implementing the GÉANT Data Protection Code of Conduct [2];\n'+
            '2) are members of the REFEDS Research and Scholarship Entity Category [3];\n'+
            '3) are CLARIN members and have the http://clarin.eu/category/clarin-member Entity\n'+
            'Category which you can use for filtering.\n\n'+
            'Therefore, we kindly ask you to implement a filter releasing the required attributes to all\n'+
            'CLARIN SPF members.'+
            'The latest authentication attempt was to:\n'+
            'SP entityID={0}\n'+
            'Attributes released:\n{1}\n\n' +
            'Please, see the recommendation from the DFN federation which attributes to\n'+
            'release to CLARIN SPF SPs and how to do it:\n'+
            'https://wiki.aai.dfn.de/de:shibidp3attrfilter#freigabe_der_wichtigsten_attribute_fuer_clarin-sps\n'+
            'or see the CLARIN\'s attribute profile described at\n'+
            'https://www.clarin.eu/content/attributes-service-provider-federation .\n\n'+
            'Kind Regards,\n' +
            'XXX\n\n' +
            '[1] https://www.clarin.eu/ and https://www.clarin.eu/content/service-provider-federation\n' +
            '[2] http://geant3plus.archive.geant.net/uri/dataprotection-code-of-conduct/V1/Pages/default.aspx\n' +
            '[3] https://refeds.org/category/research-and-scholarship' +
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
                    var tested = at_least_one[i];
                    for (var j=0; j < d.length; ++j) {
                        if (-1 !== d[j].indexOf(tested)) {
                            return '<div><i class="fa fa-4x fa-smile-o" aria-hidden="true"></i></div>ID (kind-of) friendly';
                        }
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
            idps: './aaggreg/v1/statistics/idps',
            spf_sps: './aaggreg/v1/spf/sps'
        },

        authenticate_saml: {
        },

        notify: {
            from: 'noreply',
            to: 'lindat-technical$ufal.mff.cuni.cz',
            body: 'Check https://lindat.mff.cuni.cz/services/aaggreg/.\n',
            subject: 'New IdP [{0}] used to sign in to CLARIN infrastructure'
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
