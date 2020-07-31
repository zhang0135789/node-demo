'use strict';

const crypto = require('crypto');


class CryptoUtils {

    /**
     * sha256hash
     * @param data
     * @returns {Promise<ArrayBuffer>}
     */
    static sha256hash(string) {
        return crypto.createHash("sha512").update(string,"utf-8").digest();
    }

    static md5hash(string) {
        return crypto.createHash("md5").update(string , "utf-8").digest();
    }

    /**
     * base64 编码
     * @param string
     */
    static encryptBASE64(string) {
        return new Buffer(string).toString("base64");
    }

    /**
     * base64 解码
     * @param data
     */
    static decryptBASE64(data) {
        return new Buffer(data , "base64").toString();
    }


}


module.exports = CryptoUtils;
