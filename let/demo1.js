var oLi = [1,2,3,4,5,6];

for(var i = 0; i < oLi.length; i++) {
    oLi[i].onclick =function(event) {
        console.log(i);
    }
}