/*jslint node: true */
"use strict";



const WebSocket = require('ws');//引入模块

const wss = new WebSocket.Server({ port: 8080 });//创建一个WebSocketServer的实例，监听端口8080

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        ws.send('Hi Client');
    });//当收到消息时，在控制台打印出来，并回复一条信息

});




