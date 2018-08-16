var util = require('util');


//util.isArray(object)

console.log(util.isArray([]));
// true
console.log(util.isArray(new Array));
// true
console.log(util.isArray({}));
// false


//util.isRegExp(object)

console.log(util.isRegExp(/some regexp/));
// true
console.log(util.isRegExp(new RegExp('another regexp')));
// true
console.log(util.isRegExp({}));
// false

//util.isDate(object)
util.isDate(new Date())
// true
util.isDate(Date())
// false (without 'new' returns a String)
util.isDate({})
// false

//util.isError(object)
util.isError(new Error())
// true
util.isError(new TypeError())
// true
util.isError({ name: 'Error', message: 'an error occurred' })
// false





