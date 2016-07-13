// the main app for aaggreg backend
// by jm/lindat

var settings = require('../../settings/settings')["backend"];
var parseString = require('xml2js').parseString;
var log = require('../libs/logger')("import-attributes");
var fs = require('fs');
var utils = require('../libs/utils');
var client = require('../libs/solr')(settings.solr_loginx_core);

var input_file = process.argv[2];
log.warn("Converting xml to json [{0}]".format(input_file));
fs.readFile(input_file, 'utf8', function (err, data) {
    if (err) {
        log.error(err);
        return
    }
    parseString(data, function (err, result) {
        var docs = [];
        var idps = result["atts:parsedLog"]["atts:idps"][0]["atts:idp"];
        for (var i = 0; i < idps.length; ++i) {
            var idp = idps[i];
            var entityID = idp["$"]["entityId"];
            var timestamp = null;
            log.info("Importing [{0}]".format(entityID));
            var attrs_parent = idp["atts:seenAttrLists"][0]["atts:list"];
            var attrs_to_import = [];
            if (attrs_parent) {
                var attrs_list = attrs_parent[attrs_parent.length - 1]["atts:attr"];
                timestamp = attrs_parent[attrs_parent.length - 1]["atts:lastSeen"][0];
                if (attrs_list) {
                    for (var j = 0; j < attrs_list.length; ++j) {
                        var attr = attrs_list[j]["atts:FriendlyName"] || attrs_list[j]["atts:Name"];
                        attrs_to_import.push(attr[0]);
                    }
                }
            }
            if (0 === attrs_to_import.length){
                log.info("NO ATTRIBUTES [{0}]".format(entityID));
            }

            var sp = "https://ufal-point.mff.cuni.cz/shibboleth/eduid/sp";
            if (timestamp) {
                timestamp = timestamp.replace(" ", "T") + "Z";
            }else {
                timestamp = "1000-01-01T00:00:00Z";
            }
            var d = {
                idp: entityID,
                sp: sp,
                idpsp: "{0}|{1}".format(entityID, sp),
                attributes: attrs_to_import,
                timestamp: timestamp,
                request_ip: "0.0.0.0",
                warn: null,
                our_timestamp: timestamp
            };
            docs.push(d);
        }

        client.add(docs,function(err,obj){
            if(err){
                log.error(err);
            }else{
                client.commit(function(err,obj){
                    if(err){
                        log.error(err);
                    }
                });
            }
        });

    });
});
