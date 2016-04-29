// the main app for aaggreg backend
// by jm/lindat

var settings = require('../../settings/settings')["backend"];
var parseString = require('xml2js').parseString;
var log = require('../libs/logger')("import-attributes");
var fs = require('fs');
var utils = require('../libs/utils');
var client = require('../libs/solr')(settings.solr_loginx_core);


var query = client.createQuery();
query.q("-attributes_count:[* TO *]");
query.rows(300);
client.search(query, function(err, obj) {
    if (err) {
        log.error(err);
    } else {
        //log.info(obj);
        for (var i = 0; i < obj.response.docs.length; ++i) {
            var doc = obj.response.docs[i];
            var updated = false;
            if (!doc.idpsp) {
                updated = true;
                log.info("Updating [{0} {1}]".format(doc.idp, doc.sp));
                doc.idpsp = "{0}|{1}".format(doc.idp, doc.sp);
            }
            if (!doc.hasOwnProperty("attributes_count")) {
                updated = true;
                log.info("Updating [{0} {1}]".format(doc.idp, doc.sp));
                doc.attributes_count = doc.attributes ? doc.attributes.length : 0;
            }

            delete doc._version_;

            if (updated) {
                log.info(JSON.stringify(doc));
                client.add(doc,function(err,obj){
                    if(err){
                        log.error(err);
                    }
                });
            }
        } // for

        client.commit(function(err,obj){
            if(err){
                log.error(err);
            }
        });
    }
});

