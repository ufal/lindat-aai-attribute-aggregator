/*jshint esversion: 6 */

var fs = require('fs');
var path = require('path');
var settings = require('../../settings/settings')["backend"];
var log = require('../libs/logger')("crons");
var CronJob = require('cron').CronJob;
var utils = require('../libs/utils');
var client = require('../libs/solr')(settings.solr_entities_core);
var app = require('../app');
var feed = require('../feeds/feed');

log.info("Setting up cron jobs");

var run_cron_on_start = !(process.env.RUN_CRON_ON_START && "false" === process.env.RUN_CRON_ON_START.toLowerCase());
log.info("Running cron on start: %s", run_cron_on_start);

/**
 * SOLR updating of fields is not what we can use so we have to do it manually.
 */
function merge_documents(doc, doc_to_merge) {
    for (var key in doc_to_merge) {
        // would conflict - do not merge it
        if ("_version_" === key) {
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

function entity_ftor(entities, entities_entry, last_one) {
    var doc = {
        entityID: entities_entry.entityID,
        type: entities_entry.type,
        registrationAuthority: entities_entry.registrationAuthority,
        registrationAuthorityDate: entities_entry.registrationAuthorityDate,
        displayName_en: entities_entry.displayName_en,
        displayDesc_en: entities_entry.displayDesc_en,
        logo: entities_entry.logo,
        requested: entities_entry.requested,
        requested_required: entities_entry.requested_required,
        email_support: entities_entry.email_support,
        email_administrative: entities_entry.email_administrative,
        email_technical: entities_entry.email_technical,
        entityAttributes: entities_entry.entityAttributes,
        feeds: entities_entry.feeds
    };
    
    merge_documents(entities_entry, doc);
}


// help solr guessing - (not really used just informative)
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
    entityAttributes: ["string"],
    feeds: ["array"]
};


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
            var entities = {
                done: 0
            };
            // now this approach has some issues (e.g., race conditions, performance)
            // but the changed data are not that important and performance is not an issue...
            feed.download_and_parse(
                entity_ftor, entities, settings.feeds.spf_idp_feed, "spf_idp_feed", settings.temp_dir
            );
            feed.download_and_parse(
                entity_ftor, entities, settings.feeds.spf_sp_feed, "spf_sp_feed", settings.temp_dir
            );
            feed.download_and_parse(
                entity_ftor, entities, settings.feeds.edugain_feed, "edugain_feed", settings.temp_dir
            );
            feed.download_and_parse(
                entity_ftor, entities, settings.feeds.spf_homeless_feed, "spf_homeless_feed", settings.temp_dir
            );

            Object.values = obj => Object.keys(obj).map(key => obj[key]);

            function check_and_commit() {
                log.info("Done {0} items...".format(entities["done"]));
                if (4 === entities["done"]){
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
        run_cron_on_start
    );

} catch(ex) {
    log.error('cron pattern not valid - {0}'.format(ex));
}