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
	"UK Access Management Federation": "http://ukfederation.org.uk",
	"InCommon Federation": "https://incommon.org",
	"Fédération Éducation-Recherche": "https://federation.renater.fr/",
	"DFN-AAI": "https://www.aai.dfn.de",
	"CAFe Federation": "http://cafe.rnp.br",
	"SURFconext Federation": "http://www.surfconext.nl/",
	"IDEM federation": "http://www.idem.garr.it/",
	"eduID.cz": "http://www.eduid.cz/",
	"WAYF Federation": "https://www.wayf.dk",
	"SWAMID Federation": "http://www.swamid.se/",
	"ACOnet Identity Federation (eduID.at)": "http://eduid.at",
	"GRNET Federation": "http://aai.grnet.gr/",
	"SWITCHaai Federation": "http://rr.aai.switch.ch/",
	"Edugate Federation": "http://www.heanet.ie",
	"Belnet Federation": "http://federation.belnet.be/",
	"CAF Federation": "http://www.canarie.ca",
	"SIR Federation": "http://www.rediris.es/",
	"ArnesAAI Federation": "http://aai.arnes.si",			
	"LAIFE Federation": "http://laife.lanet.lv/",
	"eduID.hu Federation": "http://eduid.hu",
	"Haka": "http://www.csc.fi/haka",
	"PIONIER Federation": "https://aai.pionier.net.pl",
	"eduID.lu": "http://eduid.lu",
	"TAAT Federation": "http://taat.edu.ee",
	"LITNET FEDI Federation": "https://fedi.litnet.lt",
	"RENATA Federation": "http://colfire.co",
	"COFRe Federation": "http://cofre.reuna.cl",
	"LEAF": "http://federations.renam.md/",
	"GRENA Identity Federation": "https://mtd.gif.grena.ge",
	"PEANO Federation": "https://peano.uran.ua",
	"RCTSaai Federation": "https://www.fccn.pt",
	"GakuNin Federation": "https://www.gakunin.jp",
	"FEIDE Federation": "http://feide.no/",
	"IUCC Identity Federation": "http://iif.iucc.ac.il",
	"AAI@eduHr Federation": "http://www.srce.hr",
	"Australian Access Federation": "https://aaf.edu.au",
	"ASNET Armenia": "https://aai.asnet.am",
	"Minga Ecuadorian federation": "https://minga.cedia.org.ec",
	"FEDUrus Identity Federation": "http://www.fedurus.ru/",
	"CARSI Federation": "http://www.carsi.edu.cn/",
	"Grid IDentity Pool Federation": "https://gridp.garr.it/",
	"INFLIBNET Access Management Federation": "http://parichay.inflibnet.ac.in/",
	"MARWAN Federation": "http://www.marwan.ma/",
	"Tuakiri Federation": "https://tuakiri.ac.nz/"
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
							results[fedName] = {};
							results[fedName]["met.refeds_count"] = 0;							
							results[fedName]["idp_count"] = facet_counts[i].count;
							results[fedName]["edugain"] = 0;
							results[fedName]["spf"] = 0;
							for(j=0;j<facet_counts[i].pivot.length;j++) {
								results[fedName][facet_counts[i].pivot[j].value] = facet_counts[i].pivot[j].count;								
							}
						}						
						
						request({
						    url: "https://met.refeds.org/?export=federations&format=json",
						    json: true
						}, function (error, response, body) {						
						    if (error && response.statusCode != 200) {
						    	log.error(error);
						    }
						    
						    for(name in response.body) {
						    	if(name in results) {
						    		results[name]["met.refeds_count"] = response.body[name].IDPSSO;
						    	} else {
						    		results[name] = {};
						    		results[name]["met.refeds_count"] = response.body[name].IDPSSO;
						    		results[name]["idp_count"] = 0;
						    		results[name]["edugain"] = 0;
						    		results[name]["spf"] = 0;
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