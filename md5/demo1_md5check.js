//md5校驗碼

var crypto = require('crypto');

var str = 'lihaipingmd5';


var md5 = crypto.createHash("md5");

md5.update(str);

var result = md5.digest("hex");

console.log(result);