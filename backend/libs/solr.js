var log = require('../libs/logger')("solr");
var settings = require('../../settings/settings')["backend"];
var solr = require('solr-client');

log.info("Creating SOLR client at %s:%s ", settings.solr_host, settings.solr_port);
module.exports = function(core) {
    return solr.createClient({
        host: settings.solr_host,
        port: settings.solr_port,
        core: core,
        solrVersion: '6.0'
    });
};
