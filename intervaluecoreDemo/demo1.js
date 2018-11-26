/**
 * 使用签名接口首先要引用intervaluecore的依赖
 * 在package.json的dependencies中添加"intervaluecore": "git+https://github.com/intervalue/intervalue-lightnodecore-3.0-testnet.git"
 *
 */

/**
 * 助记词生成方法
 */

var Mnemonic = require('bitcore-mnemonic');
var crypto = require('crypto');
var objectHash = require('intervaluecore/object_hash.js');
var ecdsaSig = require('intervaluecore/signature');
var Bitcore = require('bitcore-lib');

//生成助记词
var mnemonic = new Mnemonic("shield salmon sport horse cool hole pool panda embark wrap fancy equip");
//助记词进行验证
while(!Mnemonic.isValid(mnemonic.toString())) {
    mnemonic = new Mnemonic();
}
console.log(mnemonic.toString());


/**
 * 公私钥生成方法
 *
 * passphrase 钱包默认为空
 */
var passphrase = "";
//生成公私钥
var HDprivKey = mnemonic.toHDPrivateKey(passphrase);
//私钥//扩展私钥
var xprivate = HDprivKey.xprivkey;
//公钥//扩展公钥
var xpublic = HDprivKey.hdPublicKey.xpubkey;


/**
 * 签名 验证
 * 私钥签名,公钥验证
 * 私钥的格式为32位字节数组
 * 公钥的格式为base64编码后的公钥
 */


var str = "需要签名的数据";
var hash = crypto.createHash("sha512").update(str,"utf-8").digest();

while(true) {

    var xPrivKey = Bitcore.HDPrivateKey.fromString(xprivate);

    var xPublic = Bitcore.HDPublicKey.fromString(xpublic);

    //主私钥
    var privateKey = xPrivKey.privateKey.bn.toBuffer({size:32});
    //主公钥
    var publickey = xPublic.publicKey.toBuffer().toString("base64");

    //进行签名
    var signature = ecdsaSig.sign(hash,privateKey);

    //验证签名
    var flag = ecdsaSig.verify(hash,signature,publickey);

    if(flag)
        console.log("验证成功");
    else {
        console.log("验证失败");
    }
}

/**
 * 地址生成过程
 * inve钱包地址采用BIP44提议 由定义生成钱包地址
 * 定义的模板 [\"sig\", {\"pubkey\":\""+ DSA.encryptBASE64(public) +"\"}]
 * 公钥为  m44'/0'/0'/0 /0
 */

//生成 m/44'/0'/0'/0/0 的公钥
var path = "m/44'/0'/0'";
var path2 = "m/0/0";
var hdprivatekey = HDprivKey.derive(path);
var test = HDprivKey.derive("m/44'/0'/0'/0/0");
var public = test.publicKey.toBuffer().toString("base64");
var pubkey = Bitcore.HDPublicKey(hdprivatekey).derive(path2).publicKey.toBuffer().toString("base64");
//定义模板
var definition = ["sig",{"pubkey":public}];

//生成地址
var address = objectHash.getChash160(definition);

console.log("钱包对应地址:" +address);






