// show
//

var fs = require('fs');
var path = require('path');
var express = require('express');
var settings = require('../../settings/settings')["backend"];
var utils = require('../libs/utils');
var router = express.Router();
var log = require('../libs/logger')("/v1/got/");
var client = require('../libs/solr')(settings.solr_entities_core);

function handle(req, res) {
    var ret = {
        "ok": false
    };
    try {

        var d = req.query;
        if (!d.entityID) {
            ret["exception"] = "missing entityID attribute";
            res.json(ret);
            return;
        }
        var query = client.createQuery();
        var q = 'entityID:"{0}"'.format(d.entityID);
        query.q(q);
        query.rows(5);
        client.search(query, function(err, obj) {
            if (err) {
                log.error(err);
                res.json(ret);
                return
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

router.get('/', function(req, res) {
    return handle(req, res);
});

module.exports = router;