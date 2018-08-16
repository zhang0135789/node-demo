var rpc = require('json-rpc2');

var client = rpc.Client.$create(6332, 'localhost');

// Call add function on the server

client.call('getinfo', [1, 2], function(err, result) {

    console.log(err);
    console.log(result);
});



