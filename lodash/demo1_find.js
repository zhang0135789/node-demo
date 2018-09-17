var _ = require("lodash");

var arr = [
    { 'name': 'barney',  'age': 36, 'blocked': false },
    { 'name': 'fred',    'age': 40, 'blocked': true },
    { 'name': 'pebbles', 'age': 1,  'blocked': false }
];

var res = _.find(arr,{name:"fred"});
console.log(res);