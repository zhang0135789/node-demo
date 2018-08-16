//server


var rpc = require("json-rpc2");

var server = rpc.Server.$create({
    'websocket': true, // is true by default
    'headers': { // allow custom headers is empty by default
        'Access-Control-Allow-Origin': '*'
    }
});



function add(args, opt, callback) {
    console.log("args:" + args);
    // callback("err111");
    var result = null;
    result = args[0] + args[1];
    callback(!result, !result ? undefined:args[0] + args[1]);
}

server.expose('add', add);

// you can expose an entire object as well:

server.expose('namespace', {
    'function1': function(){},
    'function2': function(){},
    'function3': function(){}
});


server.listen(8000, 'localhost');
console.log("server is started");




