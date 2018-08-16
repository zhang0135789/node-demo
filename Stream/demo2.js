
//写入流


var fs = require('fs');
var data = "www.baidu.com";

var writeStream = fs.createWriteStream('output.txt');

writeStream.write(data,"utf-8");

//标记末尾
writeStream.end();

writeStream.on('finish', function() {
    console.log("写入完成。");
});

writeStream.on('error',function () {

    console.log(err.stack);
});


console.log("程序执行完毕");