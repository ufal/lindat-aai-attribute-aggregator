// version
//

var express = require('express');
var package_info = require('../../package.json');
var router = express.Router();

/* GET version. */
router.get('/', function(req, res) {
    res.json( {
        "author": package_info.author,
        "version": package_info.version
    } );
});

module.exports = router;
