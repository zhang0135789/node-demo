/*jslint node: true */
"use strict";

const WebSocket = require('ws');
const readline = require('readline')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const ws = new WebSocket('ws://127.0.0.1:8286');
// const ws = new WebSocket('ws://localhost:4000');

ws.on('open', function open() {



    // 监听键入回车事件
    rl.on('line', (str) => {
        // str即为输入的内容
        if (str === 'close') {
            // 关闭逐行读取流 会触发关闭事件
            rl.close()
        }

        var data = {
            command:["explorer",{"subject":"start","body":{"unit":"h0JXo0f2WutwojCj4hDqUyf1pSt1dLaGBLxTHr6rpog=","result":"known"}}],
            userid:"2",
            ctime:"3",
            vers:"1.0.0"};

        console.log(str);

        ws.send(JSON.stringify(data));
    })


});//在连接创建完成后发送一条信息

ws.on('message', function incoming(data) {
    console.log(data);
});


// 监听关闭事件
rl.on('close', () => {
    console.log('触发了关闭事件');
    rl.close()
    process.exit();
})
