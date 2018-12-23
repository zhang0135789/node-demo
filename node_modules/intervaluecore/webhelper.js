"use strict";

let sa = require("superagent");
// let request = require("request");
let timeout = 5 * 1000;
class WebHelper {
    static httpGet(url, headers) {
        return new Promise(function (resolve, reject) {
            sa
                .get(url)
                .set(headers == null ? {} : headers)
                .end(function (err, res) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    console.log(JSON.stringify(res.text));
                    resolve(res.text);
                });
        });
    }


    static httpPost(url, headers, data) {
        return new Promise(function (resolve, reject) {
            sa
                .post(url)
                .type('form')
                .set(headers == null ? {} : headers)
                .send(data)
                .timeout(timeout)
                .end(function (err, res) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(res.text);
                });
        });
    }
}

module.exports = WebHelper;