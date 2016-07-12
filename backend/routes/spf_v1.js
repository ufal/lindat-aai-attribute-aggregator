var fs = require('fs');
var express = require('express');
var settings = require('../../settings/settings')["backend"];
var router = express.Router();
var log = require('../libs/logger')("/v1/spf/");
var feed = require('../feeds/feed');
var uuid = require('uuid');

router.get('/', function(req, res) {
	var ret = {
		ok : false,
        result: []
	};
	try {
        var feed_name = "spf_sp_feed_{0}".format(uuid.v1());
        feed.download_and_parse(function(entities, entity, last_one) {
            ret.result.push(entity);
            if (last_one) {
                res.json(ret);
            }
        }, {}, settings.feeds.spf_idp_feed, feed_name, settings.temp_dir);

    } catch (err) {
		ret["exception"] = err;
		log.error(err);
		res.json(ret);
	}
});

module.exports = router;