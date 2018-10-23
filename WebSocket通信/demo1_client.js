/*jslint node: true */
"use strict";


const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', function open() {
    ws.send('Hi Server');
});//在连接创建完成后发送一条信息

ws.on('message', function incoming(data) {
    console.log(data);
    ws.send("hello world");
});