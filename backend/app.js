// the main app for aaggreg backend
// by jm/lindat

var express = require('express');
var path = require('path');
var log = require('./libs/logger')("app");
var logger = require('morgan');
var mkdirp = require('mkdirp');

var debug = require('debug')('aaggreg');

var cors = require('cors');
var utils = require('./libs/utils');

var settings = require('../settings/settings')["backend"];


var app = module.exports = express();

// `global` variables
//
app.locals.entities_updated = "never";


var index_v1 = require('./routes/index_v1');
var version = require('./routes/version');
var got_v1 = require('./routes/got_v1');
var list_v1 = require('./routes/list_v1');
var details_v1 = require('./routes/details_v1');
var entity_v1 = require('./routes/entity_v1');
var statistics_v1 = require('./routes/statistics_v1');
var spf_v1 = require('./routes/spf_v1');
var idps_v1 = require('./routes/idps_v1');
//var attributes_v1 = require('./routes/attributes_v1');

// view engine setup
//

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.engine('html', require('ejs').renderFile);
app.set('json spaces', 2);

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));


// paths
//

app.use(cors());

var bindings = [
    ['/', index_v1],
    ['/version', version],
    ['/v1/got', got_v1],
    ['/v1/list', list_v1],
    ['/v1/details', details_v1],
    ['/v1/entity', entity_v1],
    ['/v1/statistics', statistics_v1],
    ['/v1/statistics/idps', idps_v1],
    ['/v1/spf/sps', spf_v1]
];
for (var i=0; i < bindings.length; ++i) {
    app.use(bindings[i][0], bindings[i][1]);
    // make debugging friendlier
    app.use('/aaggreg' + bindings[i][0], bindings[i][1]);
}

// specific paths
//

app.use(function(req, res, next) {
    var special_urls = ["/www", "/settings"];
    for (var i = 0; i < special_urls.length; ++i) {
        var special_url = special_urls[i];
        if (req.url.startsWith(special_url)) {
            req.url = req.url.substr(special_url.length);
            break;
        }
    }
    next();
});

app.use(express.static(path.join(__dirname, '..', 'www')));
app.use(express.static(path.join(__dirname, '..', 'settings')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// create temp directory
//

var temp_dir = settings.temp_dir;
if (!utils.exists_dir(temp_dir)) {
    mkdirp(temp_dir, 0755, function (err) {
        logger('app').error(err);
    });
}


// error handlers
//

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    log.info("In development mode!");
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


app.set('port', process.env.PORT || 3001);
app.set('hostname', process.env.HOSTNAME || "127.0.0.1");
log.info('Env variable hostname [%s] and port [%s]', process.env.HOSTNAME, process.env.PORT);

var server = app.listen(app.get('port'), app.get('hostname'), function() {
  log.info('Express server listening on port ' + server.address().port);
});

// set up repetitive tasks
var crons = require('./crons/cronjobs');
