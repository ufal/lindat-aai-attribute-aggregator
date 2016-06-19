var fs = require('fs');
var path = require('path');
var express = require('express');
var settings = require('../../settings/settings')["backend"];
var utils = require('../libs/utils');
var router = express.Router();
var log = require('../libs/logger')("/v1/got/");

router.get('/', function(req, res) {
	return handle(req, res);
});

function handle(req, res) {
	var ret = {
		"ok" : false
	};
	try {

		ret.ok = "Under Construction";
		res.json(ret);
		
	} catch (err) {
		ret["exception"] = err;
		log.error(err);
		res.json(ret);
	}
}

module.exports = router;