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

function get_english(arr) {
    for (var i =0; i < arr.length; ++i) {
        if ("en" == arr[i]["$"]["xml:lang"]) {
            return arr[i]["_"];
        }
    }
    return 0 < arr.length ? arr[0]["_"] : "N/A";
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
    entityAttributes: ["string"]
};

/**
 * Parse xml to json and add each entity to solr, then commit.
 */
function parse_entities_and_commit(result, name_file_friendly, log_errors)
{
    var entities = result["md:EntitiesDescriptor"]["md:EntityDescriptor"];
    log.info("Parsing {0} entities [{1}]".format(entities.length, name_file_friendly));
    for (var i = 0; i < entities.length; ++i) {
        var entity = entities[i];
        var entityID = entity["$"]["entityID"];
        try {
            var registrationAuthority = null;
            var registrationAuthorityDate = null;
            try {
                var reg_info = entity["md:Extensions"][0]["mdrpi:RegistrationInfo"][0];
                var registrationAuthority = reg_info["$"]["registrationAuthority"];
                var registrationAuthorityDate = reg_info["$"]["registrationInstant"];
            } catch (err) {
            }

            // entity attributes
            //
            var eattrs = [];
            try {
                var entityattrs = entity["md:Extensions"][0]["mdattr:EntityAttributes"];
                for (var j = 0; j < entityattrs.length; ++j) {
                    var ea = entityattrs[j];
                    eattrs.push(ea["Name"]);
                }
            }catch(err){
            }


            // idp/sp
            //

            var desc = null;
            if (entity.hasOwnProperty("md:IDPSSODescriptor")) {
                desc = entity["md:IDPSSODescriptor"][0];
            }else if (entity.hasOwnProperty("md:SPSSODescriptor")){
                desc = entity["md:SPSSODescriptor"][0];
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
                var requested_arr = desc["md:AttributeConsumingService"][0]["md:RequestedAttribute"];
                var requested = [];
                var requested_required = [];
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

            var people = entity["md:ContactPerson"];
            var emails = {};
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

            // add & commit
            //

            var doc = {
                entityID: entityID,
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
            client.add(doc, function (err, obj) {
                if (err) {
                    log.error(err);
                }
            });
        }catch(exc) {
            log.warn("[{0}] parsing error - {1}".format(entityID, exc))
            throw exc;
        }

    } // for

    client.commit(function(err,obj){
        if(err){
            log.error(err);
        }
        log.info("Entities committed [{0}]".format(name_file_friendly))
    });

    //log.info(JSON.stringify(result, null, 4));
}


function download_and_parse(url_feed, name_file_friendly, log_errors) {
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
                parse_entities_and_commit(result, name_file_friendly, log_errors);
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
            download_and_parse(settings.feeds.spf_idp_feed, "spf_idp_feed");
            download_and_parse(settings.feeds.spf_sp_feed, "spf_sp_feed");
            download_and_parse(settings.feeds.edugain_feed, "edugain_feed");

        }, function () {
            log.warn("Finished parsing SPF feeds.");
        },
        true,
        "Europe/Prague",
        null,
        false
    );

} catch(ex) {
    log.error('cron pattern not valid - {0}'.format(ex));
}