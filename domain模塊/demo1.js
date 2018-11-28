/**
 * domain模块，把处理多个不同的IO的操作作为一个组。注册事件和回调到domain，
 * 当发生一个错误事件或抛出一个错误时，domain对象会被通知，不会丢失上下文环境，
 * 也不导致程序错误立即退出，与process.on('uncaughtException')不同。
 Domain 模块可分为隐式绑定和显式绑定：
 隐式绑定: 把在domain上下文中定义的变量，自动绑定到domain对象
 显式绑定: 把不是在domain上下文中定义的变量，以代码的方式绑定到domain对象
 */



var EventEmitter = require("events").EventEmitter;
var domain = require("domain");

var emitter1 = new EventEmitter();

// 创建域
var domain1 = domain.create();

domain1.on('error', function(err){
    console.log("domain1 处理这个错误 ("+err.message+")");
});

// 显式绑定
domain1.add(emitter1);


//监听器无法处理到的错误
emitter1.on('error',function(err){
    console.log("监听器处理此错误 ("+err.message+")");
});

emitter1.emit('error',new Error('通过监听器来处理'));

emitter1.removeAllListeners('error');

emitter1.emit('error',new Error('通过 domain1 处理'));





var domain2 = domain.create();

domain2.on('error', function(err){
    console.log("domain2 处理这个错误 ("+err.message+")");
});



//隐式绑定
domain2.run(function(){
    var emitter2 = new EventEmitter();
    // throw  '11111';
    emitter2.emit('error',new Error('通过 domain2 处理'));
});
//
//
domain1.remove(emitter1);
emitter1.emit('error', new Error('转换为异常，系统将崩溃!'));