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

router.get('/', function(req, res) {
    return handle(req, res);
});

function handle(req, res) {
    var ret = {
        "ok": false
    };
    try {

        var d = req.query;
        var query = client.createQuery();
        q = !d.q ? '*:*' : d.q;
        query.q(q);
        query.rows(0).facet({
            on: true,
            query: "*:*",
            limit: 1000,
            field: ["idp", "sp", "idpsp"]
        });
        client.search(query, function(err, obj) {
            if (err) {
                log.error(err);
            } else {
                //log.info(obj);
                ret["ok"] = true;
                ret["result"] = {
                    facets: obj.facet_counts.facet_fields
                }
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