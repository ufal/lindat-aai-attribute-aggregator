var fs = require('fs');
var path = require('path');
var settings = require('../../settings/settings')["backend"];
var log = require('../libs/logger')("crons");
var CronJob = require('cron').CronJob;
var utils = require('../libs/utils');
var parseString = require('xml2js').parseString;
var client = require('../libs/solr')(settings.solr_entities_core);
var app = require('../app');

log.info("Setting up cron jobs");

/**
 * SOLR updating of fields is not what we can use so we have to do it manually.
 */
function merge_documents(doc, doc_to_merge) {
    for (var key in doc_to_merge) {
        // would conflict - do not merge it
        if ("_version_" == key) {
            continue;
        }
        if (doc_to_merge.hasOwnProperty(key)) {
            var value = doc_to_merge[key];
            // not there - add it
            if (!doc.hasOwnProperty(key)) {
                doc[key] = value;
            }else {
                // both arrays and new value has more elements - take it
                if( Object.prototype.toString.call( doc[key] ) === '[object Array]'
                    && Object.prototype.toString.call( value ) === '[object Array]'  )
                {
                    if (doc[key].length < value.length) {
                        doc[key] = value;
                    }
                // doc value is null
                }else if (doc[key] === null) {
                    doc[key] = value;
                }
            }
        }
    }
}

function get_english(arr) {
    for (var i =0; i < arr.length; ++i) {
        if ("en" == arr[i]["$"]["xml:lang"]) {
            return arr[i]["_"];
        }
    }
    return 0 < arr.length ? arr[0]["_"] : "N/A";
}

function dbg(o) {
    log.info(JSON.stringify(o, null, 4));
}


// help solr guessing
//
var example_doc = {
    entityID: "TESTenitityID",
    registrationAuthority: "string",
    registrationAuthorityDate: "2013-08-20T06:55:04Z",
    displayName_en: "string",
    displayDesc_en: "string",
    logo: "string",
    requested: ["array"],
    requested_required: ["array"],
    email_support: "string",
    email_administrative: "string",
    email_technical: "string",
    type: "string",
    entityAttributes: ["string"]
};

/**
 * Parse xml to json and add each entity to solr, then commit.
 */
function parse_entities_and_commit(g_entities, result, name_file_friendly, log_errors)
{
    var entities = result["md:EntitiesDescriptor"]["md:EntityDescriptor"];
    log.info("Parsing {0} entities [{1}]".format(entities.length, name_file_friendly));

    for (var i = 0; i < entities.length; ++i) {
        var entity = entities[i];
        var entityID = entity["$"]["entityID"];

        var entities_entry = g_entities[entityID];
        if (!entities_entry) {
            entities_entry = {};
            g_entities[entityID] = entities_entry;
        }

        try {
            var registrationAuthority = null;
            var registrationAuthorityDate = null;
            try {
                var extensions = entity["md:Extensions"];
                for (var j=0; j < extensions.length; ++j) {
                    var extension = extensions[j];
                    if (extension.hasOwnProperty("mdrpi:RegistrationInfo")) {
                        var reg_info = extension["mdrpi:RegistrationInfo"][0];
                        registrationAuthority = reg_info["$"]["registrationAuthority"];
                        registrationAuthorityDate = reg_info["$"]["registrationInstant"];
                        break;
                    }
                }
            } catch (err) {
            }

            // entity attributes
            //
            var eattrs = [];
            try {
                var entityattrs = entity["md:Extensions"][0]["mdattr:EntityAttributes"];
                for (var j = 0; j < entityattrs.length; ++j) {
                    var ea = entityattrs[j];
                    for (var k = 0; k < ea["saml:Attribute"].length; ++k) {
                        eattrs.push(ea["saml:Attribute"][k]["saml:AttributeValue"][0].trim());
                    }
                }
            }catch(err){
            }


            // idp/sp
            //

            var type = null;
            var desc = null;
            if (entity.hasOwnProperty("md:IDPSSODescriptor")) {
                desc = entity["md:IDPSSODescriptor"][0];
                type = "idp";
            }else if (entity.hasOwnProperty("md:SPSSODescriptor")){
                desc = entity["md:SPSSODescriptor"][0];
                type = "sp";
            }else if (entity.hasOwnProperty("md:AttributeAuthorityDescriptor")) {
                continue;
            }else {
                log.info("[{0}]: unrecognised entity - not IdP, SP, AA".format(entityID));
                continue;
            }
            var mdui = null;
            try {
                mdui = desc["md:Extensions"][0]["mdui:UIInfo"][0];
            }catch(err){
                if (log_errors) {
                    log.info("[{0}]: missing mdui:UIInfo".format(entityID));
                }
            }

            // display names
            //

            var displayName_en = null;
            var displayDesc_en = null;
            try {
                displayName_en = get_english(mdui["mdui:DisplayName"]);
                displayDesc_en = get_english(mdui["mdui:Description"]);
            } catch (err) {
            }

            var logo = null;
            try {
                logo = mdui["mdui:Logo"][0]["_"];
                if (!logo.startsWith("http")) {
                    logo = null;
                }
            } catch (err) {
            }

            // requested
            //

            try {
                var requested_required = [];
                var requested = [];
                var requested_arr = desc["md:AttributeConsumingService"][0]["md:RequestedAttribute"];
                for (var j = 0; j < requested_arr.length; ++j) {
                    requested.push(requested_arr[j]["$"]["Name"]);
                    requested_required.push("{0}_{1}".format(
                        requested_arr[j]["$"]["Name"],
                        requested_arr[j]["$"]["isRequired"]
                    ));
                }
            } catch (err) {
                if(log_errors) {
                    log.info("[{0}]: missing RequestedAttribute".format(entityID));
                }
            }

            // contacts
            //

            var emails = {};
            var people = entity["md:ContactPerson"];
            for (var j = 0; j < people.length; ++j) {
                var person = people[j];
                try {
                    emails[person["$"]["contactType"]] = person["md:EmailAddress"][0].replace("mailto:", "");
                }catch(err){
                    // could be a telephone
                    if (log_errors) {
                        log.info("[{0}]: missing EmailAddress".format(entityID));
                    }
                }
            }

            // now this approach has some issues (e.g., race conditions, performance)
            // but the changed data are not that important and performance is not an issue...

            // this is our doc
            var doc = {
                entityID: entityID,
                type: type,
                registrationAuthority: registrationAuthority,
                registrationAuthorityDate: registrationAuthorityDate,
                displayName_en: displayName_en,
                displayDesc_en: displayDesc_en,
                logo: logo,
                requested: requested,
                requested_required: requested_required,
                email_support: emails["support"],
                email_administrative: emails["administrative"],
                email_technical: emails["technical"],
                entityAttributes: eattrs
            };

            merge_documents(entities_entry, doc);

        }catch(exc) {
            log.warn("[{0}] parsing error - {1}".format(entityID, exc));
            throw exc;
        }

    } // for

    log.info("Finished parsing [{0}]".format(name_file_friendly))
}


function download_and_parse(entities, url_feed, name_file_friendly, log_errors) {
    log.warn("Downloading {0}".format(name_file_friendly));
    var output_file = path.join(utils.temp_dir(settings.temp_dir), name_file_friendly);

    utils.download(url_feed, output_file, function(err) {
        log.warn("Download complete [{0}]".format(name_file_friendly));
        if (err) {
            log.error(err);
            return;
        }
        log.warn("Converting xml to json [{0}]".format(name_file_friendly));
        fs.readFile(output_file, 'utf8', function (err, data) {
            if (err) {
                log.error(err);
                return
            }
            parseString(data, function (err, result) {
                parse_entities_and_commit(entities, result, name_file_friendly, log_errors);
                entities["done"] += 1;
            });
        });
    });
}

// cron jobs
//

try {
    var job = new CronJob('00 30 * * * *', 
        function() {

            // example document
            //
            log.info("Adding example document - explicitly specify types...");
            client.add(example_doc);

            app.locals.entities_updated = new Date();

            // parse
            //
            var entities = {};

            entities["done"] = 0;
            download_and_parse(entities, settings.feeds.spf_idp_feed, "spf_idp_feed");
            download_and_parse(entities, settings.feeds.spf_sp_feed, "spf_sp_feed");
            download_and_parse(entities, settings.feeds.edugain_feed, "edugain_feed");
            download_and_parse(entities, settings.feeds.spf_homeless_feed, "spf_homeless_feed");

            Object.values = obj => Object.keys(obj).map(key => obj[key]);

            function check_and_commit() {
                log.info("Done {0} items...".format(entities["done"]));
                if (4 == entities["done"]){
                    delete entities["done"];
                    // ouch
                    var values = Object.values(entities);
                    // add & commit
                    client.add(values, function (err, obj) {
                        if (err) {
                            log.error(err);
                            return;
                        }
                        client.commit(function (err, obj) {
                            if (err) {
                                log.error(err);
                                return;
                            }
                            log.info("Entities committed [{0}]".format(values.length))
                        });
                    });
                }else {
                    setTimeout(check_and_commit, 1000);
                }
            }
            setTimeout(check_and_commit, 1000);

        }, function () {
            log.warn("Finished parsing feeds.");
        },
        true,
        "Europe/Prague",
        null,
        true
    );

} catch(ex) {
    log.error('cron pattern not valid - {0}'.format(ex));
}