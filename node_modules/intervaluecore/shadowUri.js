/*jslint node: true */
"use strict";

/**
 *验证是否为生成热钱包
 * @param uri
 * @param cb
 * @returns {*}
 */
function shadowParseUri(uri, cb) {
    var arrMatches = uri.match('shadow');
    if (!arrMatches) {
        return cb.ifError("is not shadow!!!");
    }
    return cb.ifOk(uri);
}

/**
 * 热钱包扫码付款验证
 * @param uri
 * @param cb
 * @returns {*}
 */
function isHotParseUri(uri, cb) {
    var arrMatches = uri.match('isHot');
    if (!arrMatches) {
        return cb.ifError("is not isHot");
    }
    return cb.ifOk(uri);
}

exports.shadowParseUri = shadowParseUri;
exports.isHotParseUri = isHotParseUri;