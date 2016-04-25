// Declare this variable before loading RequireJS JavaScript library

var require = {
    shim : {
        "bootstrap" : { "deps" :['jquery'] },
    },
    paths: {
        "jquery" : "lib/jquery-2.2.3.min",
        "bootstrap" : "lib/bootstrap.min",
    }
};