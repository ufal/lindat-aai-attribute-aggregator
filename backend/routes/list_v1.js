// show
//

var fs = require('fs');
var path = require('path');
var express = require('express');
var settings = require('../../settings/settings')["backend"];
var utils = require('../libs/utils');
var router = express.Router();
var log = require('../libs/logger')("/v1/got/");
var solr = require('solr-client');

log.info("Creating SOLR client at %s:%s ", settings.solr_host, settings.solr_port);
var client = solr.createClient({
    host: settings.solr_host,
    port: settings.solr_port,
    core: settings.solr_core,
    solrVersion: '6.0'
});

// not storing dialogue
router.post('/', function(req, res) {
    return handle(req, res);
});

router.get('/', function(req, res) {
    return handle(req, res);
});

function handle(req, res) {
    var ret = {
        "ok": false
    };
    try {

        var query = client.createQuery();
        query.q({ '*' : '*' }).rows(30).sort("our_timestamp asc");
        client.search(query, function(err, obj) {
            if (err) {
                log.error(err);
                res.json(ret);
            } else {
                //log.info(obj);
                ret["ok"] = true;
                ret["result"] = obj.response.docs;
            }
            res.json(ret);
        });

    }catch(err) {
        ret["exception"] = err;
        log.error(err);
        res.json(ret);
    }
}

module.exports = router;