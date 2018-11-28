/**
 * 瀑布模型
 * 瀑布流函数，串行执行数组中的每一个函数，最后执行回调函数
 * async.waterfall
 * async.waterfall(tasks,callback)
 * 第一个参数tasks是数组，数组包含的是需要依次执行的函数名
 * 第二个参数为回调函数，当瀑布流函数执行出现错误时，会执行这个回调函数并将错误信息返回。
 * 当瀑布流函数无错误时，会在执行完tasks数组中包含的函数后执行这个回调函数
 *
 *
 */

var objs = [{name:'A'}, {name:'B'}, {name:'C'}];

function doSomething(obj, cb) {
    console.log("我在做" + obj.name + "这件事!");
    cb(null, obj);
}

var async = require('async');

async.waterfall([
    function (cb) {
        doSomething(objs[0],function (err, dataA) {
            console.log(dataA);
            cb(err,dataA);
        });
    },
    function (dataA,cb) {
        doSomething(objs[1],function (err, dataB) {
            console.log(dataB);
            cb(err,dataA,dataB);
        });
    },
    function (dataA,dataB,cb) {
        doSomething(objs[2],function (err, dataC) {
            console.log(dataC);
            cb(err, dataA, dataB, dataC);
        });
    },
],function (err, dataA, dataB, dataC) {
    if(err) {
        console.log('处理错误~!');
    }else {
        console.log('处理成功~!');
        console.log(dataA);
        console.log(dataB);
        console.log(dataC);
    }

});