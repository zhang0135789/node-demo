//总金额
var sum  = 100 * 1000;

//基本价
var base = 100;

//总股数
var volume = 1000;

var num = 10;

//涨幅
var quote_change = 0.09;

//卖出总价
var sell = 0;
//买入总价
var buy  = 0;

var grid = 9;
//基本价
var base2 = 100;
//卖出总价
var sell2 = 0;
//买入总价
var buy2  = 0;

// 跌
for(let i = 0 ; base > 50 ; i++) {
    //new Price
    base = base - (base * quote_change);
    console.log("【当前价格"+ base +"】");
    //买入
    buy += num * base;

    base2 = base2 - grid;
    console.log("【当前价格2"+ base2 +"】");
    buy2 += num * base2;
    num--;
}

//涨
for(let i = 0 ; base < 100 ; i++) {
    base = base + (base*quote_change);
    console.log("【当前价格"+ base +"】");
    sell += num * base;

    base2 = base2 + grid;
    console.log("【当前价格2"+ base2 +"】");
    sell2 += num * base2;
    num++;
}

console.log("=========");
console.log(buy);
console.log(sell);
console.log("[收益]" + (buy - sell));

console.log("=========");
console.log(buy2);
console.log(sell2);
console.log("[收益]" +  (buy2 - sell2));