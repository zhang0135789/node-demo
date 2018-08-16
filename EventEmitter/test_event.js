//引入 event
var events = require('events');

var eventEmitter = new events.EventEmitter();

// 使用匿名函数绑定 data_received 事件
eventEmitter.on('data_received', function(){
    console.log('数据接收成功。');
});


//創建事件處理程序
var connectHandler = function connected() {
    console.log("connect successful!");

    //觸發  data_received事件
    eventEmitter.emit('data_received');
}





//綁定 connection 事件處理程序
eventEmitter.on('connection', connectHandler);




// 触发 connection 事件
eventEmitter.emit('connection');

console.log("程序执行完毕。");