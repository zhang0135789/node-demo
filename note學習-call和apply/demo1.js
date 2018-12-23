/**
 *
 * 使用call和apply可以改变上下文执行对象，
 * 可以在自定义上下文中执行函数，
 * 两者作用相同，仅仅是方法的第二个参数不同，call直接使用参数列表，apply使用参数数组。
 *
 * 具体作用是调用一个对象的方法，以另一个对象替换当前对象，实际上市改变this指向的对象内容。
 * 感謝作者:segmentfault平臺的 芒果屋里的猫
 * 原文地址:https://segmentfault.com/a/1190000008364772?utm_source=tuicool&utm_medium=referral
 */


console.log("-------------------------------demo1----------------------------")

var pet1 = {
    words: '...',
    speak: function(say){
        console.log(say + ' ' + this.words);
    }
};
pet1.speak('Speck');

console.log("-------------------------------demo2----------------------------")

/**
 * dog对象本来没有speak方法，通过call的方法，
 * 偷梁换柱地将原本指向pet的this变量指向了dog,因此在运行时，
 * this.words='wang'，所以打印出Speak wang。
 * 通过这种方式，我们可以使一个对象去使用另一个对象的方法，
 * 一个容易想到的应用场景就是继承。
 */

var pet2 = {
    words: '...',
    speak: function(say){
        console.log(say + ' ' + this.words);
    }
}

var dog2 = {
    words:'wang'
}

pet2.speak.call(dog2,'Speak');   // Speak wang



console.log("-------------------------------demo3----------------------------")

function Pet3(words){
    this.words = words;
    this.speak = function(){
        console.log(this.words);
    }
}

function Dog3(words){
    //Pet.call(this,words);  // Pet中的this指向当前的Dog,使Dog拥有Pet的方法
    Pet3.apply(this,[words]);  // apply中的第二个参数是一个数组
}

var dog3 = new Dog3('wang');
dog3.speak();




console.log("-------------------------------demo4----------------------------")

function print(a, b, c, d){
    console.log(a + b + c + d);
}
function example(a, b , c , d){
    //用call方式借用print,参数显式打散传递
    print.call(this, a, b, c, d);

    //用apply方式借用print, 参数作为一个数组传递,

    //可以直接用JavaScript方法内本身有的arguments数组
    print.apply(this, arguments);

    //或者封装成数组
    print.apply(this, [a, b, c, d]);
}
example(1,1,1,1);