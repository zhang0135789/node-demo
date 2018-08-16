var async = require('async');





async.series(
{
    one: function(callback){
        console.log(callback);


        callback(null, 1) ;
    },
    two: function(callback){
        callback(null, 2);
    }
}


,function(err, results) {
    console.log(results);
});
