var settings = require('../../settings/settings')["backend"];
var log = require('../libs/logger')("keys");
var cron_job = require('cron').CronJob;

var job = new cron_job('00 30 * * * *', function() {
    console.log("Working on " + settings.spf.idp_feed);

    }, function () {
        log.info("Finished parsing SPF feeds.");
    },
    false,
    "Europe/Prague"
);