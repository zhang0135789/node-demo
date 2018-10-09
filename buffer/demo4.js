

var base32 = require('thirty-two');

var zeroString = "00000000";

function buffer2bin(buf) {
    var bytes = [];
    for (var i = 0; i < buf.length; i++) {
        var bin = buf[i].toString(2);
        if (bin.length < 8) // pad with zeros
            bin = zeroString.substring(bin.length, 8) + bin;
        bytes.push(bin);
    }
    return bytes.join("");
}




var aaa = "LODT6IH6TGKPSYBGREXVFNEJGQTBXJPB";
var chash = base32.decode(aaa);


var binChash = buffer2bin(chash);