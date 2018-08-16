const buf = Buffer.from('runoob', 'ascii');

// 输出 72756e6f6f62
console.log(buf.toString('hex'));

// 输出 cnVub29i
console.log(buf.toString('base64'));

console.log(buf.toString('ascii'));

//长度为10 的缓存区，以1填充 ，编码格式ascii
const buf1 = Buffer.alloc(10 , 1 ,  'utf8');

console.log( buf1.toString('utf8'));


//缓存区  读取  写入
buf2 = Buffer.alloc(20);
len = buf2.write("www.runoob.com");
value = buf2.toString("utf8" , 0 , 4);
console.log("写入字节数 : "+  len);
console.log(value);

//转换为json对象
console.log(buf2.toJSON());
