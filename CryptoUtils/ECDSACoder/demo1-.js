/*jslint node: true */
"use strict";
var ecdsa = require('./ECDSACoder');
var crypto = require('crypto');
var Bitcore = require('bitcore-lib');


var str = "需要签名的数据";
var hash = crypto.createHash("sha512").update(str,"utf-8").digest();


let pri = "MEECAQAwEwYHKoZIzj0CAQYIKoZIzj0DAQcEJzAlAgEBBCCiBQW0GB3nQaoBqKYGWyRDWp1ZeawhNv56Uc3WePUPuQ==";
let pub = "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE4+MhOutSJ611ViUe0CDeMbD+ZUfriYAK8ptAZKVdD9fnbAYh00Bh6yJy6Ms4lScpc+LVw/6rmbZ/sSz4FoE0zA==";

var Mnemonic = require('bitcore-mnemonic');
var mnemonic = new Mnemonic("shield salmon sport horse cool hole pool panda embark wrap fancy equip");


var passphrase = "";
//生成公私钥
var HDprivKey = mnemonic.toHDPrivateKey(passphrase);
//私钥//扩展私钥
var xprivate = HDprivKey.xprivkey;
//公钥//扩展公钥
var xpublic = HDprivKey.hdPublicKey.xpubkey;

var xPrivKey = Bitcore.HDPrivateKey.fromString(xprivate);

var xPublic = Bitcore.HDPublicKey.fromString(xpublic);

//主私钥
var privateKey = xPrivKey.privateKey.bn.toBuffer({size:32}).toString("base64");
//主公钥
var publickey = xPublic.publicKey.toBuffer().toString("base64");
console.log(privateKey)
console.log(publickey)

let sig = ecdsa.sign(hash,privateKey);
console.log(sig)
