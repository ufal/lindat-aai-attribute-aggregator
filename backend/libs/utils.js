// utils
//
var fs = require('fs');
var http = require('http');
var https = require('https');
var path = require('path');

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

String.prototype.startsWith = function(prefix) {
    return this.indexOf(prefix) === 0;
};

if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    };
}

function list_files( dir, ftor ) {
    var all_files = fs.readdirSync( dir );
    var files = [];
    for ( var i = 0; i < all_files.length; ++i ) {
        var file = all_files[i];
        var filepath = dir + '/' + file;
        if (fs.statSync(filepath).isFile()) {
            files.push(file);
            if ( !(null == ftor) ) {
                ftor(file);
            }
        }
    }
    return files;
}

function list_dirs( dir ) {
    var all_files = fs.readdirSync( dir );
    var files = [];
    for ( var i = 0; i < all_files.length; ++i ) {
        var name = dir + '/' + all_files[i];
        if (fs.statSync(name).isDirectory()) {
            files.push(all_files[i]);
        }
    }
    return files;
}

function cmd_exec(cmd, args) {
    var sync = require('child_process').spawnSync;
    var child = sync(cmd, args);
    return child;
}

function temp_name(f, suffix) {
    var crypto = require('crypto');
    return 'uploaded-' + f + crypto.randomBytes(6).readUInt32LE(0) + "." + suffix;
}

function is_url(s) {
    return s.startsWith('http');
}

function download(url, output, callback) {
    var file = fs.createWriteStream(output);
    var mod = http;
    if (url.startsWith('https')) {
        mod = https;
    }
    var request = mod.get(url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            file.close(callback); // close() is async, call callback after close completes.
        });
        file.on('error', function (err) {
            fs.unlink(dest); // Delete the file async. (But we don't check the result)
            if (callback)
                callback(err.message);
        });
    });
}

function exists_in(dir_arr, f) {
    if ( dir_arr.constructor === Array ) {
        for ( var i = 0; i < dir_arr.length; ++i ) {
            var newf = path.join(dir_arr[i], f);
            if (exists_file(newf)) {
                return newf;
            }
        }

    }else {
        var newf = path.join(dir_arr, f);
        if (exists_file(newf)) {
            return newf;
        }
    }
    return null;
}

function exists_file(f) {
    try {
        var stats = fs.lstatSync(f);
        return stats.isFile();
    }catch(e){
        return false;
    }
}

function exists_dir(f) {
    if ( f.constructor === Array ) {
        for (var i = 0; i < f.length; ++i ) {
            var stats = fs.lstatSync(f[i]);
            if ( stats.isDirectory() ) {
                return f[i];
            }
        }
    }else {
        var stats = fs.lstatSync(f);
        if ( stats.isDirectory() ) {
            return f;
        }
    }
    return false;
}

var walk_files = function (p, ftor, rel_p) {
    var files = fs.readdirSync(p);
    if (!rel_p) {
        rel_p = "./";
    }
    for (var i in files) {
        var f = path.join(p, files[i]);
        var new_rel_p = path.join(rel_p, files[i]);
        var stats = fs.statSync(f);
        if (stats.isFile()) {
            ftor(f, new_rel_p);
        }else if (stats.isDirectory()) {
            walk_files(f, ftor, new_rel_p);
        }
    }
};

function array_eq (a1, a2) {
    if (!a1 || !a2)
        return false;

    // compare lengths - can save a lot of time
    if (a1.length != a2.length) {
        return false;
    }

    for (var i = 0, l=a1.length; i < l; i++) {
        // Check if we have nested arrays
        if (a1[i] instanceof Array && a2[i] instanceof Array) {
            // recurse into the nested arrays
            if (!array_eq(a1[i], a2[i])) {
                return false;
            }
        }else if (is_number(a1[i])) {
            var pl = 1000000;
            var n1 = Math.round(a1[i] * pl) / pl;
            var n2 = Math.round(a2[i] * pl) / pl;
            if (n1 != n2) {
                return false;
            }
        }else if (a1[i] != a2[i]) {
            return false;
        }
    }
    return true;
}

function dict_eq(d1, d2) {
    if (!d1 || !d2)
        return false;

    // compare lengths - can save a lot of time
    var k1 = Object.keys(d1);
    var k2 = Object.keys(d2);
    if (k1.length != k2.length) {
        return false;
    }

    for (var i = 0; i < k1.length; ++i) {
        var k = k1[i];
        // Check if we have nested arrays
        if (d1[k] !== d2[k]) {
            return false;
        }
    }
    return true;
}

function is_number(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

exports.cmd_exec = cmd_exec;
exports.list_files = list_files;
exports.list_dirs = list_dirs;
exports.temp_name = temp_name;
exports.is_url = is_url;
exports.download = download;
exports.exists_in = exists_in;
exports.exists_file = exists_file;
exports.exists_dir = exists_dir;
exports.walk_files = walk_files;
exports.array_eq = array_eq;
exports.dict_eq = dict_eq;
exports.is_number = is_number;
