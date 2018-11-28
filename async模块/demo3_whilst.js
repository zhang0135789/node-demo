/**
 *
 * async.whilst
 *
 * whilst(test, iteratee, callbackopt)
 * 第一个参数：循环判断函数。判断是否执行第二个函数的条件，类似于循环条件，返回true继续执行
 * 第二个参数：循环执行函数。异步执行的操作，执行完毕后修改循环条件
 * 第三个参数：回调函数。当函数出错时立即执行返回错误信息。
 *
 *
 */

var async = require("async");

var i = 0;

async.whilst(
    function() {
        return i < 3;
    },
    function (cb) {
        console.log(i);
        i++;
        cb();
    },
    function(err) {         //here 如果条件不满足，或者发生异常
        console.log("err is:" + err);
        console.log("end,the i is:" + i);
    }

);


i = 0;
async.whilst(
    function() {
        return i < 3;   //true，则第二个函数会继续执行，否则，调出循环
    },
    function(whileCb) { //循环的主体
        console.log(i);
        i++;
        if(i == 2)
        {
            whileCb("It's time to break.");
        }
        else
        {
            whileCb();
        }
    },
    function(err) {         //here 如果条件不满足，或者发生异常
        console.log("err is:" + err);
        console.log("end,the i is:" + i);
    }
);



