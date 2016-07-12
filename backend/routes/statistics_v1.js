var fs = require('fs');
var path = require('path');
var express = require('express');
var settings = require('../../settings/settings')["backend"];
var utils = require('../libs/utils');
var router = express.Router();
var log = require('../libs/logger')("/v1/statistics/");
var loginx = require('../libs/solr')(settings.solr_loginx_core);
var entities = require('../libs/solr')(settings.solr_entities_core);

router.get('/', function(req, res) {
	return handle(req, res);
});

function handle(req, res) {
	var ret = {
		"ok" : false
	};
	try {
		var func = req.query.func;
		if (func.toLowerCase() == "getra_counts") {
			var query = entities
					.createQuery()
					.q("type:idp")
					.rows(0)
					.facet({
						on : true,
						mincount : 1,
						limit : 9999,
						missing : true
					})
					.set(
							"facet.pivot=registrationAuthority,entityID,feeds&facet.pivot.mincount=1");

			entities
					.search(
							query,
							function(err, obj) {
								if (err) {
									log.error(err);
									ret["error"] = err;
								} else {
									ret["ok"] = true;
									ret["results"] = obj.facet_counts.facet_pivot["registrationAuthority,entityID,feeds"];
								}
								res.json(ret);
							});

		} else if (func.toLowerCase() == "getsp_counts") {
			var query = loginx
					.createQuery()
					.q("*:*")
					.sort("timestamp desc")
					.rows(0)
					.group({
						on : true,
						main : true,
						field : "idpsp",
						truncate : true
					})
					.facet({
						on : true,
						mincount : 1,
						limit : 9999,
						missing : true
					})
					.set("facet.pivot=sp,idp,attributes&facet.pivot.mincount=1");
			loginx
					.search(
							query,
							function(err, obj) {
								if (err) {
									log.error(err);
									ret["error"] = err;
								} else {
									ret["ok"] = true;
									ret["results"] = obj.facet_counts.facet_pivot["sp,idp,attributes"];
								}
								res.json(ret);
							});

		} else {
			ret["error"] = "unknown parameter for func '" + func + "'";
			res.json(ret);
		}
	} catch (err) {
		ret["exception"] = err;
		log.error(err);
		res.json(ret);
	}
}

module.exports = router;