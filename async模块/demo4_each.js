/**
 *
 * async,each
 * async.eachSeries
 * async.eachSeries(coll,iteratee,callback)
 * 用来异步执行一系列的操作,保证每次遍历都执行完毕后再执行下一次的操作
 * 第一个参数:可以是一个数组或一个对象（用来遍历）。
   第二个参数:是每次遍历执行的函数。
   第三个参数:是回调函数，当遍历中出错会立刻执行回调函数并返回错误信息，
             若没有发生错误则会等遍历结束后将正确的结果返回。
 *
 */

var async = require('async');

var objs = [{name:'A'}, {name:'B'}, {name:'C'}];

function doSomething(obj, cb){
    console.log("我在做" + obj.name + "这件事!");
    cb(null, obj);
}

async.each(objs,
    function(obj, callback) {
        doSomething(obj, function(){
            callback();
        });
    },
    function(err){
        console.log("err is:" + err);
    }
);

async.each(objs,
    function(obj, callback) {
        doSomething(obj, function(){
            callback("It's a err.");
        });
    },
    function(err) {
        console.log("err is:" + err);
    }
);
/**========================================================*/
console.log("========================================================");

async.eachSeries(objs,
    function(obj, callback) {
        doSomething(obj, function(){
            callback();
        });
    }, function(err){
        console.log("err is:" + err);
    }
);


//和each是有明显区别的，如果没有异步调用，和each无差别，如果有异步调用，则区别十分大
async.eachSeries(objs,
    function(obj, callback) {
        doSomething(obj, function(){
            callback("It's a err.");
        });
    },
    function(err){
        console.log("err is:" + err);
    }
);

