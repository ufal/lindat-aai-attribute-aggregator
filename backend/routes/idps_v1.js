var fs = require('fs');
var path = require('path');
var express = require('express');
var request = require("request")
var settings = require('../../settings/settings')["backend"];
var utils = require('../libs/utils');
var router = express.Router();
var log = require('../libs/logger')("/v1/got/");
var entities = require('../libs/solr')(settings.solr_entities_core);

var name2ra = {
		"aaf": "https://aaf.edu.au",
		"aai-eduhr": "http://www.srce.hr",
		"aconet": "http://eduid.at",
		"afire": "https://aai.asnet.am",
		"arnes-aai": "http://aai.arnes.si",
		"belnet": "http://federation.belnet.be/",
		"cafe": "http://cafe.rnp.br",
		"caf": "http://www.canarie.ca",
		"carsi": "http://www.carsi.edu.cn/",
		"cofre": "http://cofre.reuna.cl",
		"colfire": "http://colfire.co",
		"dfn-aai": "https://www.aai.dfn.de",
		"edugate": "http://www.heanet.ie",
		"eduid-cz": "http://www.eduid.cz/",
		"eduid-hu": "http://eduid.hu",
		"eduud-lu": "http://eduid.lu",
		"fedurus": "http://www.fedurus.ru/",
		"feide": "http://feide.no/",
		"fer": "https://federation.renater.fr/",
		"gakunin": "https://www.gakunin.jp",
		"grena": "https://mtd.gif.grena.ge",
		"grididp": "https://gridp.garr.it/",
		"grnet": "http://aai.grnet.gr/",
		"haka": "http://www.csc.fi/haka",
		"idem": "http://www.idem.garr.it/",
		"incommon": "https://incommon.org",
		"inflibnet": "http://parichay.inflibnet.ac.in/",
		"iucc": "http://iif.iucc.ac.il",
		"laife": "http://laife.lanet.lv/",
		"leaf": "http://federations.renam.md/",
		"litnet": "https://fedi.litnet.lt",
		"minga": "https://minga.cedia.org.ec",
		"peano": "https://peano.uran.ua",
		"pionier": "https://aai.pionier.net.pl",
		"rctsaai": "https://www.fccn.pt",
		"sir": "http://www.rediris.es/",
		"surfconext": "http://www.surfconext.nl/",
		"swamid": "http://www.swamid.se/",
		"switchaai": "http://rr.aai.switch.ch/",
		"taat": "http://taat.edu.ee",
		"tuakiri": "https://tuakiri.ac.nz/",
		"ukamf": "http://ukfederation.org.uk",
		"wayf": "https://www.wayf.dk"
};

var ra2name = {};

router.get('/', function(req, res) {
	return handle(req, res);
});

function handle(req, res) {
	var ret = {
		"ok" : false
	};
	for(name in name2ra) {
		ra2name[name2ra[name]] = name;
	}	
	try {
		
		var query = entities
			.createQuery()
			.q("type:idp")
			.rows(0)
			.facet({
				on : true,
				mincount : 1,
				limit : 9999
			})
			.set("facet.pivot=registrationAuthority,feeds&facet.pivot.mincount=1");

		entities
			.search(
				query,
				function(err, obj) {
					if (err) {
						log.error(err);
						ret["error"] = err;
					} else {
						var facet_counts = obj.facet_counts.facet_pivot["registrationAuthority,feeds"];
						
						var results = {};
						
						for(i=0;i<facet_counts.length;i++) {
							var fedName = ra2name[facet_counts[i].value];
							if(fedName==null) {
								fedName = facet_counts[i].value;
							}
							results[fedName] = {};
							results[fedName]["name"] = facet_counts[i].value;
							results[fedName]["registration_authority"] = facet_counts[i].value; 
							results[fedName]["wiki.edugain_idp_count"] = 0;							
							results[fedName]["our_idp_count"] = facet_counts[i].count;
							results[fedName]["edugain"] = 0;
							results[fedName]["spf"] = 0;							
							for(j=0;j<facet_counts[i].pivot.length;j++) {
								results[fedName][facet_counts[i].pivot[j].value] = facet_counts[i].pivot[j].count;								
							}
						}						
						
						request({
						    url: "https://wiki.edugain.org/isFederatedCheck/Federations/?format=json",
						    json: true
						}, function (error, response, body) {						
						    if (error && response.statusCode != 200) {
						    	log.error(error);
						    }
						    
						    for(name in response.body.Federations) {
						    	if(name=="edugain") continue;
						    	if(name in results) {
						    		results[name]["name"] = response.body.Federations[name].Name;
						    		results[name]["wiki.edugain_idp_count"] = response.body.Federations[name].IdentityProviders;
						    		results[name]["country"] = response.body.Federations[name].Country;
						    	} else {
						    		results[name] = {};
						    		if(name in name2ra)
						    			results[name]["registration_authority"] = name2ra[name];
						    		else 
						    			results[name]["registration_authority"] = response.body.Federations[name].Website;
						    		results[name]["name"] = response.body.Federations[name].Name;
						    		results[name]["wiki.edugain_idp_count"] = response.body.Federations[name].IdentityProviders;
						    		results[name]["our_idp_count"] = 0;
						    		results[name]["edugain"] = 0;
						    		results[name]["spf"] = 0;
						    		results[name]["country"] = response.body.Federations[name].Country;
						    	}
						    }
						    
						    ret["ok"] = true;
						    ret["results"] = results;
							res.json(ret);
						});

					}
				});		

		
	} catch (err) {
		ret["exception"] = err;
		log.error(err);
		res.json(ret);
	}
}

module.exports = router;