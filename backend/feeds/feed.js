var path = require('path');
var fs = require('fs');
var log = require('../libs/logger')("feed");
var utils = require('../libs/utils');
var parseString = require('xml2js').parseString;
var entity = require('../feeds/entity');


/**
 * Parse xml to json and add each entity to solr, then commit.
 */
function parse_entities(entity_ftor, entities, result, feed_name)
{
    var es = result["md:EntitiesDescriptor"]["md:EntityDescriptor"];
    log.info("Parsing {0} entities [{1}]".format(es.length, feed_name));

    for (var i = 0; i < es.length; ++i) {
        var e = es[i];
        var entityID = entity.get_entityID(e);

        // get the entity or parse it
        var e_inst = entities[entityID];
        if (!e_inst) {
            e_inst = new entity(e);
            entities[entityID] = e_inst;
        }

        // feeds
        e_inst.feeds.push(feed_name);

        try {
            // do something reasonable
            var last_one = (i == es.length - 1);
            entity_ftor(entities, e_inst, last_one);

        }catch(exc) {
            log.warn("[{0}] parsing error - {1}".format(entityID, exc));
            throw exc;
        }

    } // for

    log.info("Finished parsing [{0}]".format(feed_name))
}


/**
 * Downloads asynchronously url_feed to temp_dir and parses objects into entities.
 *
 * @param entity_ftor
 * @param entities
 * @param url_feed
 * @param file_name_friendly_feed
 * @param temp_dir
 */
function download_and_parse(entity_ftor, entities, url_feed, file_name_friendly_feed, temp_dir)
{
    if (!entities.hasOwnProperty("done")) {
        entities["done"] = 0;
    }

    log.warn("Downloading {0}".format(file_name_friendly_feed));
    var output_file = path.join(utils.temp_dir(temp_dir), file_name_friendly_feed);

    utils.download(url_feed, output_file, function(err) {

        log.warn("Download complete [{0}]".format(file_name_friendly_feed));
        if (err) {
            log.error(err);
            return;
        }

        log.warn("Converting xml to json [{0}]".format(file_name_friendly_feed));
        fs.readFile(output_file, 'utf8', function (err, data) {
            if (err) {
                log.error(err);
                return
            }
            parseString(data, function (err, result) {
                var feed_name = file_name_friendly_feed.split("_")[0];
                parse_entities(entity_ftor, entities, result, feed_name);
                entities["done"] += 1;
            });
        });
    });
}


module.exports.download_and_parse = download_and_parse;