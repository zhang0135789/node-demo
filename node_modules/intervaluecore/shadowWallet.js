/*jslint node: true */
"use strict";

var getSourceString = require('./string_utils').getSourceString;
var Bitcore = require('bitcore-lib');

var crypto = require('crypto');
var objectHash = require('./object_hash.js');
var ecdsaSig = require('./signature');


var signatureCode;
var signatureDetlCode;

var RANDOM;


/**
 * 热钱包 生成授权签名-扫描地址
 * @param address
 * @param cb
 * @returns
 */
exports.getSignatureCode = function(address,cb){
    RANDOM = crypto.randomBytes(4).toString("hex");
    console.log(RANDOM);
    var db = require("./db");
    db.query("select count(1) as t from my_addresses where address = ?",[address],function (rs) {
        if(rs[0].t == 0) {
            signatureCode =
                {
                    name:"shadow",
                    type:"sign",
                    addr:address,
                    random:RANDOM
                };
            return cb(signatureCode);
        }else {
            return cb("wallet exists");
        }
    });
};

/**
 * 冷钱包  进行授权签名
 * @param signatureCode
 * @param words
 * @param cb
 * @returns {*}
 */
exports.getSignatureDetlCode = function(signatureCode,xPrivkey, cb){
    if(xPrivkey == null || xPrivkey == "") {
        cb("xPrivkey could not be null~!");
        return ;
    }

    var json;
    switch(typeof signatureCode) {
        case "string":
            json = JSON.parse(signatureCode);
            break;
        case "object":
            json = signatureCode;
            break;
        default:
            cb(false);
            break;
    }
    var sign_json = {
        name:"shadow",
        type:"sign",
        addr:json.addr,
        random:json.random
    };


    var buf_to_sign = crypto.createHash("sha256").update(getSourceString(sign_json), "utf8").digest();

    var xPrivKey = new Bitcore.HDPrivateKey.fromString(xPrivkey);


    var path = "m/44'/0'/0'/0/0";
    var privateKey = xPrivKey.derive(path).privateKey.bn.toBuffer({size:32});
    var sign_64 = ecdsaSig.sign(buf_to_sign, privateKey);

    var path2 = "m/44'/0'/0'";
    var privateKey2 = xPrivKey.derive(path2);
    var xpubkey = Bitcore.HDPublicKey(privateKey2).xpubkey;

    var pubkey = derivePubkey(xpubkey ,"m/0/0");

    signatureDetlCode =
        {
            name:"shadow",
            type:"signDetl",
            signature:sign_64,
            random:json.random,
            expub:xpubkey +'',
            addr:json.addr,
            pubkey:pubkey
        };
    return cb(signatureDetlCode);
};

function derivePubkey(xPubKey, path) {
    var hdPubKey = new Bitcore.HDPublicKey(xPubKey);
    return hdPubKey.derive(path).publicKey.toBuffer().toString("base64");
}


/**
 * 热钱包  生成热钱包
 * @param signatureDetlCode
 * @param cb
 * @returns {*}
 */
exports.generateShadowWallet = function(signatureDetlCode,cb){
    if(!RANDOM) {
        return cb("random failed");
    }
    var json;
    switch(typeof signatureDetlCode) {
        case "string":
            json = JSON.parse(signatureDetlCode);
            break;
        case "object":
            json = signatureDetlCode;
            break;
        default:
            cb(false);
            break;
    }
    if(RANDOM != json.random) {
        return cb("random failed");
    }

    var addr = json.addr;
    var sign = json.signature;
    var xpub = json.expub;
    var pubkey = json.pubkey;

    var sing_json = {
        name:"shadow",
        type:"sign",
        addr:addr,
        random:json.random
    };

    var result = {
        'addr':addr,
        'sign':sign,
        'xpub':xpub,
        'pubkey':pubkey
    };
    var buf_to_sign = crypto.createHash("sha256").update(getSourceString(sing_json), "utf8").digest();

    var pub1 = ecdsaSig.recover(buf_to_sign,sign,1).toString("base64");
    var pub2 = ecdsaSig.recover(buf_to_sign,sign,0).toString("base64");
    var definition1 = ["sig",{"pubkey":pub1}];
    var definition2 = ["sig",{"pubkey":pub2}];
    var address1 = objectHash.getChash160(definition1);
    var address2 = objectHash.getChash160(definition2);

    if(address1 === addr  || address2 == addr) {
        RANDOM = '';
        cb(result);
    } else
        cb("validation failed");
};


//查找钱包
exports.getWallets = function (cb) {
    var data = [];

    var db = require('./db');
    db.query("select address,wallet from my_addresses",function (result) {
        if(result.length > 0) {
            var n = 1;
            result.forEach(function(r) {
                var addr = r.address;
                var wallet = r.wallet;
                var obj = {
                    "name": n++,
                    "addr":addr,
                    "amount":0,
                    "walletId":wallet
                };

                data.push(obj);
            });
            cb(data);
        }
    });
};





var light = require("./light");
/**
 * 热钱包生成交易授权签名
 * @param opts
 * @param cb
 * @returns {*}
 */
exports.getTradingUnit = function (opts ,cb) {

    switch(typeof opts) {
        case "string":
            opts = JSON.parse(signatureDetlCode);
            break;
        case "object":
            opts = opts;
            break;
        default:
            cb(false);
            break;
    }

    if (opts.change_address == opts.to_address) {
        return cb("to_address and from_address is same");
    }

    if (typeof opts.amount !== 'number')
        return cb('amount must be a number');
    if (opts.amount < 0)
        return cb('amount must be positive');


    var isHot = opts.ishot;

    var objectLength = require("./object_length.js");
    var timestamp = Math.round(Date.now() / 1000);

    var obj = { fromAddress: opts.change_address, toAddress: opts.to_address, amount: ""+opts.amount, timestamp};

    obj.fee = ""+objectLength.getTotalPayloadSize(obj);


    //TODO test
    if (light.findStable(params.wallet) < (parseInt(obj.fee) + parseInt(obj.amount))) {
        return cb("not enough spendable funds from " + obj.to_address + " for " + (parseInt(obj.fee) + parseInt(obj.amount)));
    }

    var db = require("./db");
    db.query("SELECT wallet, account, is_change, address_index,definition FROM my_addresses JOIN wallets USING(wallet) WHERE address=? ",[obj.from[0].address],function (row) {
        var address;

        if(row.length > 0) {
            address = {
                definition: JSON.parse(row[0].definition),
                wallet: row[0].wallet,
                account: row[0].account,
                is_change: row[0].is_change,
                address_index: row[0].address_index
            };
            obj.pubkey = address.definition[1].pubkey;
            obj.type = 1;

            var authorized_signature = obj;

            var h = crypto.createHash("md5");
            h.update(JSON.stringify(authorized_signature));
            var md5 = h.digest("hex");

            authorized_signature.type = "trading";
            authorized_signature.md5 = md5;
            authorized_signature.name = "isHot";

            cb(authorized_signature);
        }

    });

};

/**
 *  冷钱包进行签名
 * @param opts
 * @param words
 * @param cb
 * @returns {Promise<void>}
 */
exports.signTradingUnit = function (opts ,xPrivkey ,cb) {

    if(xPrivkey == null || xPrivkey == "") {
        cb("xPrivkey could not be null~!");
        return ;
    }

    switch(typeof opts) {
        case "string":
            opts = JSON.parse(signatureDetlCode);
            break;
        case "object":
            opts = opts;
            break;
        default:
            cb(false);
            break;
    }
    var name = opts.name;
    var md5 = opts.md5;
    var type = opts.type;

    delete opts.name;
    delete opts.md5;
    delete opts.type;

    var obj = opts;

    var h = crypto.createHash("md5");

    h.update(JSON.stringify(obj));

    var result = h.digest("hex");

    if( result != md5) {
        return cb("validation failed");
    }

    var buf_to_sign = objectHash.getUnitHashToSign(obj);

    //签名
    // var mnemonic = new Mnemonic(words);
    // var xPrivKey = mnemonic.toHDPrivateKey("");
    var xPrivKey = new Bitcore.HDPrivateKey.fromString(xPrivkey);

    var path = "m/44'/0'/0'/0/0";
    var privateKey = xPrivKey.derive(path).privateKey.bn.toBuffer({size:32});
    var signature = ecdsaSig.sign(buf_to_sign, privateKey);

    var path2 = "m/44'/0'/0'";
    var privateKey2 = xPrivKey.derive(path2);
    var xpubkey = Bitcore.HDPublicKey(privateKey2).xpubkey;

    var pubkey = derivePubkey(xpubkey ,"m/0/0");

    var flag = ecdsaSig.verify(buf_to_sign,signature,pubkey);


    opts.type = "sign";
    opts.name = "isHot";
    opts.signature = signature;

    if(flag) {
        cb(opts);
    } else {
        cb("signature failed");
    }
};


