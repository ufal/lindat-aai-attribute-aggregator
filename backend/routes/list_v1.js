// show
//

var fs = require('fs');
var path = require('path');
var express = require('express');
var settings = require('../../settings/settings')["backend"];
var utils = require('../libs/utils');
var router = express.Router();
var log = require('../libs/logger')("/v1/got/");
var client = require('../libs/solr')(settings.solr_loginx_core);

function handle(req, res) {
    var ret = {
        "ok": false
    };
    try {

        var d = req.query;
        var query = client.createQuery();
        var q = !d.q ? '*:*' : d.q;
        query.q(q);
        query.rows(d.rows || 30).sort({our_timestamp: "desc"});
        client.search(query, function(err, obj) {
            if (err) {
                log.error(err);
                res.json(ret);
                return;
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