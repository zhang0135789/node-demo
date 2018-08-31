
//base64 編碼 解碼

//編碼
var b = new Buffer('JavaScript');
var s = b.toString('base64');
// SmF2YVNjcmlwdA==

//解碼
var bf = new Buffer(s, 'base64')
var result = b.toString();

console.log(result);