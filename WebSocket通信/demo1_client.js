/*jslint node: true */
"use strict";


const WebSocket = require('ws');

const ws = new WebSocket('ws://192.168.5.144:8080/websocket');
// const ws = new WebSocket('ws://localhost:4000');

ws.on('open', function open() {
    var data = {
        comm:["explorer",{"subject":"start","body":{"unit":"h0JXo0f2WutwojCj4hDqUyf1pSt1dLaGBLxTHr6rpog=","result":"known"}}],
        userid:"2",
        ctime:"3",
        vers:"1.0.0"};
    ws.send(JSON.stringify(data));
});//在连接创建完成后发送一条信息

ws.on('message', function incoming(data) {
    console.log(data);
});
