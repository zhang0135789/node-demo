var crypto = require('crypto');
var h = crypto.createHash("md5");


var opts ={"fromAddress":"4PS6MZX6T7ELDSD2RUOZRSYGCC5RHOS7","toAddress":"U2VRUTMT4ZFMQTZTFTHOSUHIZJNFHFTE","amount":"11000000","timestamp":1538207845,"fee":"0","pubkey":"A78IhF6zjQIGzuzKwrjG9HEISz7/oAoEhyr7AnBr3RWn","type":"trading","md5":"e5c3b527779503e3f545305eaac89ae3","name":"isHot"};



var md5 = opts.md5;

delete opts.name;
delete opts.md5;
var obj = {"fromAddress":opts.fromAddress,"toAddress":opts.toAddress,"amount":opts.amount,"timestamp":opts.timestamp};
obj.fee = opts.fee;
obj.pubkey = opts.pubkey;
obj.type = opts.type;
var str = getSourceString(obj);


h.update(str);
var md52 = h.digest("hex");

var falg = (md5==md52);

console.log(falg);

var STRING_JOIN_CHAR = "\x00";
function getSourceString(obj) {
    var arrComponents = [];
    function extractComponents(variable){
        if (variable === null)
            throw Error("null value in "+JSON.stringify(obj));
        switch (typeof variable){
            case "string":
                arrComponents.push("s", variable);
                break;
            case "number":
                arrComponents.push("n", variable.toString());
                break;
            case "boolean":
                arrComponents.push("b", variable.toString());
                break;
            case "object":
                if (Array.isArray(variable)){
                    if (variable.length === 0)
                        throw Error("empty array in "+JSON.stringify(obj));
                    arrComponents.push('[');
                    for (var i=0; i<variable.length; i++)
                        extractComponents(variable[i]);
                    arrComponents.push(']');
                }
                else{
                    var keys = Object.keys(variable).sort();
                    if (keys.length === 0)
                        throw Error("empty object in "+JSON.stringify(obj));
                    keys.forEach(function(key){
                        if (typeof variable[key] === "undefined")
                            throw Error("undefined at "+key+" of "+JSON.stringify(obj));
                        arrComponents.push(key);
                        extractComponents(variable[key]);
                    });
                }
                break;
            default:
                throw Error("hash: unknown type="+(typeof variable)+" of "+variable+", object: "+JSON.stringify(obj));
        }
    }

    extractComponents(obj);
    return arrComponents.join("\x00");
}