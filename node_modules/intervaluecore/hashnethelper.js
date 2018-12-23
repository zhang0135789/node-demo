'use strict';

// const Ice = require("ice").Ice;
// const rpc = require("./Hashnet").one.inve.rpc;
const webHelper = require("./webhelper.js");
const device = require("./device.js");
const secrethelper = require("./secrethelper.js");
var db = require('./db.js');
var mutex = require('./mutex.js');
var _ = require('lodash');
//运行时存放局部全节点列表
var localfullnodes = [];
//与共识网交互的类
class HashnetHelper {
    //返回一个局部全节点，供调用。
    static async buildSingleLocalfullnode() {

        if (localfullnodes.length === 0) {
            //从数据库中拉取局部全节点列表
            let list = await db.toList('select * from lfullnode_list');
            if (list.length > 0) {
                for (var l of list) {
                    let ip = l.address.split(':')[0];
                    let httpPort = l.address.split(':')[1];
                    localfullnodes.push({ ip, httpPort });
                }
            }
            else {
                //从种子节点处获取局部全节点列表
                let { pubKey } = await device.getInfo();
                localfullnodes = await HashnetHelper.getLocalfullnodeList(pubKey);
            }
        }
        if (localfullnodes.length > 0) {
            //从列表中随机挑选一个局部全节点。
            let localfullnode = localfullnodes[secrethelper.random(0, localfullnodes.length - 1)];
            console.log("get localfullnode:" + JSON.stringify(localfullnode));
            return localfullnode;
        }
        else {
            console.log("localfullnode is null.");
            return null;
        }
    }
    //初始化局部全节点列表，列表和数据库中都进行清空。
    static async initialLocalfullnodeList() {
        localfullnodes = [];
        //用队列的方式更新数据库
        await mutex.lock(["write"], async function (unlock) {
            try {
                await db.execute('delete from lfullnode_list');
            }
            catch (e) {
                console.log(e.toString());
            }
            finally {
                //解锁事务队列
                await unlock();
            }
        });
    }
    //从种子节点获取局部全节点列表
    static async getLocalfullnodeList(pubKey) {
        try {
            //从种子节点那里拉取局部全节点列表
            let localfullnodeList = await webHelper.httpPost(device.my_device_hashnetseed_url + '/getLocalfullnodeListInShard/', null, buildData({ pubKey }));
            // let localfullnodeList = await webHelper.httpPost('http://132.124.218.43:20002/getLocalfullnodeListInShard/', null, buildData({ pubKey }));
            if (localfullnodeList) {
                localfullnodeList = JSON.parse(localfullnodeList);
                let cmds = [];
                //清空数据库中的局部全节点列表，将拉取到的新的局部全节点列表放入其中。
                db.addCmd(cmds, "delete from lfullnode_list");
                for (var i = 0; i < localfullnodeList.length; i++) {
                    db.addCmd(cmds, "INSERT " + db.getIgnore() + " INTO lfullnode_list ( address ) values (?)",
                        localfullnodeList[i].ip + ':' + localfullnodeList[i].httpPort);
                }
                //用队列的方式进行数据库更新
                await mutex.lock(["write"], async function (unlock) {
                    try {
                        let b_result = await db.executeTrans(cmds);
                    }
                    catch (e) {
                        console.log(e.toString());
                    }
                    finally {
                        //解锁事务队列
                        await unlock();
                    }
                });
                return localfullnodeList;
            }
            else {
                //如果没有拉取到，则返回空数组。
                console.log("got no localfullnodeList");
                return [];
            }
        }
        catch (e) {
            console.log(e.toString());
            return [];
        }
    }
    //局部全节点访问失败，从局部全节点列表和数据库中进行删除
    static async reloadLocalfullnode(localfullnode) {
        if (localfullnode) {
            _.pull(localfullnodes, localfullnode);
            //用队列的方式进行数据库更新
            await mutex.lock(["write"], async function (unlock) {
                try {
                    await db.execute("delete from lfullnode_list where address = ?", localfullnode.ip + ':' + localfullnode.httpPort);
                }
                catch (e) {
                    console.log(e.toString());
                }
                finally {
                    //解锁事务队列
                    await unlock();
                }
            });
        }
        //如果局部全节点列表个数小于3个，需要重新初始化局部全节点列表。
        if (localfullnodes.length < 3) {
            let { pubKey } = await device.getInfo();
            let localfullnodeList = await HashnetHelper.getLocalfullnodeList(pubKey);
            if (localfullnodeList.length > 0) {
                localfullnodes = localfullnodeList;
            }
        }
    }
    //发送交易，会尝试3次
    static async sendMessage(unit, retry) {
        let result = '';
        retry = retry || 3;
        if (retry > 1) {
            for (var i = 0; i < retry; i++) {
                result = await HashnetHelper.sendMessageTry(unit);
                if (!result) {
                    break;
                }
            }
            return result;
        }
        return await HashnetHelper.sendMessageTry(unit);
    }
    //直接调用共识网的发送交易接口
    static async sendMessageTry(unit) {
        //获取局部全节点
        let localfullnode = await HashnetHelper.buildSingleLocalfullnode();
        try {
            if (!localfullnode) {
                throw new Error('network error, please try again.');
            }
            console.log("sending unit:");
            unit = JSON.stringify(unit);
            console.log(unit);
            //往共识网发送交易
            let result = await webHelper.httpPost(getUrl(localfullnode, '/sendMessage/'), null, buildData({ unit }));
            return result;
        }
        catch (e) {
            //处理失效的局部全节点
            if (localfullnode) {
                await HashnetHelper.reloadLocalfullnode(localfullnode);
            }
            return 'network error,please try again.';
        }
    }
    //获取交易记录
    static async getTransactionHistory(address) {
        //获取局部全节点
        let localfullnode = await HashnetHelper.buildSingleLocalfullnode();
        try {
            if (!localfullnode) {
                throw new Error('network error, please try again.');
            }
            //从共识网拉取交易记录
            let result = await webHelper.httpPost(getUrl(localfullnode, '/getTransactionHistory/'), null, buildData({ address }));
            return result ? JSON.parse(result) : [];
        }
        catch (e) {
            //处理失效的局部全节点
            if (localfullnode) {
                await HashnetHelper.reloadLocalfullnode(localfullnode);
            }
            return null;
        }
    }

    static async getUnitInfo(unitId) {

        let localfullnode = await HashnetHelper.buildSingleLocalfullnode();
        try {
            if (!localfullnode) {
                throw new Error('network error, please try again.');
            }
            let result = await webHelper.httpPost(getUrl(localfullnode, '/getUnitInfo/'), null, buildData({ unitId }));
            return result ? JSON.parse(result) : null;
        }
        catch (e) {
            //处理失效的局部全节点
            if (localfullnode) {
                await HashnetHelper.reloadLocalfullnode(localfullnode);
            }
            return null;
        }
    }
}
//组装访问共识网的url
let getUrl = (localfullnode, suburl) => {
    return 'http://' + localfullnode.ip + ':' + localfullnode.httpPort + suburl;
}
//组装往共识网发送数据的对象
let buildData = (data) => {
    return { data: JSON.stringify(data) };
}

module.exports = HashnetHelper;