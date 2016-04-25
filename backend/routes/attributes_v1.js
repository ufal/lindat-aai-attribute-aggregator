// show
//

var fs = require('fs');
var path = require('path');
var express = require('express');
var settings = require('../../settings/settings')["backend"];
var utils = require('../libs/utils');
var router = express.Router();
var log = require('../libs/logger')("show");


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
    var remote_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (!remote_ip) {
        log.info("Ignoring request from [" + remote_ip + "]");
        ret["message"] = "forbidden";
        return res.json(ret);
    }

    var contents = null;
    try {
    }catch(err) {
        ret["exception"] = err.toString();
        log.info(err);
    }

    res.json(ret);
}

module.exports = router;