/*jslint node: true */
"use strict";
var async = require('async');
var db = require('./db.js');
var mutex = require('./mutex.js');
var eventBus = require('./event_bus.js');
var device = require('./device.js');
var hashnethelper = require('./hashnethelper');
var _ = require("lodash");

//判断上次拉取/更新交易列表是否完成
var u_finished = true;
//交易记录列表
var tranList = null;
//钱包收款地址
var tranAddr = [];
//可用余额
var stable = 0;
//待确认余额
var  pending = 0;

async function updateHistory(addresses) {
    //如果上次updateHistory还没完成，则返回，否则继续往下走
    if (!u_finished) {
        return;
    }
    //将u_finished设置为false，表示正在进行交易记录更新
    u_finished = false;
    //判断钱包是否切换了，如果是，则重新初始化局部全节点列表。
    if (device.walletChanged) {
        device.walletChanged = false;
        await hashnethelper.initialLocalfullnodeList();
    }
    //update化交易列表
    await iniTranList(addresses);


    //存储此次交易记录的数组
    let trans = null;
    try {
        for (var address of addresses) {
            //从共识网拉取交易记录
            let result = await hashnethelper.getTransactionHistory(address);
            //如果交易记录不为空，需要加入到待处理的数组中。
            if (result != null) {
                if (trans == null) {
                    trans = [];
                }
                if (result.length > 0) {
                    trans = trans.concat(result);
                }
            }
        }
        // console.log(JSON.stringify(trans));
        //如果为NULL，则表示访问共识网有问题，返回。
        if (trans == null) {
            return;
        }
        console.log("共识网拉取交易信息:");
        console.log(trans);


        //如果交易记录长度为零，需要清空本地的交易记录。
        if (trans.length === 0) {
            await truncateTran(addresses);
        }
        else {
            //初始化交易列表
            // await iniTranList(addresses);
            console.log("======tranList");
            for (var tran of trans) {

                // console.log(JSON.stringify(tranList));

                let my_tran = _.find(tranList, { id: tran.hash });
                //本地存在交易记录，状态是待确认，需要进行状态的更新。
                if (my_tran && tran.isStable && tran.isValid && my_tran.result == 'pending') {
                    await updateTran(tran);
                }
                //本地存在交易记录，共识网判定交易非法，需要更新交易状态到本地
                else if (my_tran && tran.isStable && !tran.isValid && my_tran.result != 'final-bad') {
                    await badTran(tran);
                }
                //本地不存在此交易记录，需往本地插入交易记录
                else if (!my_tran && tran.isValid) {
                    await insertTran(tran);

                    // if(tran.hash == 'QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ') {
                    //     db.query("update transactions set creation_date =  ?  where id =  'QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ'" , [tran.time/1000],function(rs) {
                    //         alert(rs);
                    //     });
                    // }
                }



            }
        }
    }
    catch (e) {
        console.log(e.toString());
    }
        //此次交易记录更新完毕，重置标志位。
    finally { u_finished = true; }
}

//刷新本地交易记录列表
function refreshTranList(tran) {
    let my_tran = _.find(tranList, { id: tran.id });
    //如果交易记录存在
    if (my_tran) {
        //交易的接收方
        if (tranAddr.indexOf(tran.to)) {
            //更新余额和待确认金额
            if (my_tran.result != 'good' && tran.isValid) {
                stable += tran.amount;
                pending -= tran.amount;
            }
            else if (my_tran.result == 'good' && !tran.isValid) {
                stable -= tran.amount;
            }
        }
        //交易的发送方
        else {
            if (my_tran.result != 'final-bad' && !tran.isValid) {
                //更新余额和待确认金额
                stable += tran.amount;
                stable += tran.fee;
                pending -= tran.amount;
                pending -= tran.fee;
            }
        }
        //更新交易记录的状态
        my_tran.result = getResultFromTran(tran);
    }
    else {
        //如果本地不存在记录，需要插入新的记录到列表中
        my_tran = { id: tran.hash, creation_date: tran.creation_date, amount: tran.amount, fee: tran.fee, addressFrom: tran.addressFrom, addressTo: tran.addressTo, result: getResultFromTran(tran) };
        //如果是交易的接收方
        if (tranAddr.indexOf(tran.to)) {
            //更新余额和待确认金额
            my_tran.action = 'received';
            switch (my_tran.result) {
                case 'pending':
                    pending += tran.amount;
                    break;
                case 'good':
                    stable += tran.amount;
                    break;
                case 'final-bad':
                    my_tran.action = 'invalid';
                    break;
            }
        }
        else {
            //交易的发送方
            my_tran.action = 'sent';
            switch (my_tran.result) {

                case 'pending':
                    stable -= tran.amount;
                    stable -= tran.fee;
                    pending += tran.amount;
                    pending += tran.fee;
                    break;
                case 'good':
                    stable -= tran.amount;
                    stable -= tran.fee;
                    break;
                case 'final-bad':
                    my_tran.action = 'invalid';
                    break;
            }
            //往列表中插入记录
        }
        tranList.push(my_tran);
    }
}
//通过交易的状态返回数据库中状态的值
function getResultFromTran(tran) {
    if (tran.isStable && tran.isValid) {
        return 'good';
    }
    else if (tran.isStable && !tran.isValid) {
        return 'final-bad';
    }
    else if (!tran.isStable) {
        return 'pending';
    }
}
//钱包启动后初始化余额、待确认、交易列表
async function iniTranList(addresses) {
    var rs1 = tranAddr == [];
    var rs2 = tranAddr != addresses;
    var rs3 = !tranList;
    // if (tranAddr == [] || tranAddr != addresses || !tranList) {
        tranAddr = addresses;
        //余额 = 收到 - 发送
        stable = parseInt( await db.single("select (select sum(amount) from transactions where addressTo in (?) and result = 'good') - \n\
			(select (amount + fee) from transactions where addressFrom in (?) and (result = 'good' or result = 'pending')) as stable", addresses, addresses));
        //待确认
        pending = parseInt(await db.single("select (select sum(amount) from transactions where addressTo in (?) and result = 'pending') + \n\
			(select sum(amount + fee) from transactions where addressFrom in (?) and result = 'pending') as pending", addresses, addresses));
        //交易列表
        tranList = await db.toList("select *,case when result = 'final-bad' then 'invalid' when addressFrom = ? then 'sent' else 'received' end as action \n\
		 from transactions where(addressFrom in (?) or addressTo in (?))", addresses[0], addresses, addresses);
        // console.log(tranList);
    // }
}

//交易列表
function findTranList(wallet,cb) {
    db.query("select *,case when result = 'final-bad' then 'invalid' when addressFrom in (select address from my_addresses where wallet = ?) then 'sent' else 'received' end as action \n\
		 from transactions where(addressFrom in (select address from my_addresses where wallet = ?) or addressTo in (select address from my_addresses where wallet = ?)) order by creation_date desc", [wallet, wallet,wallet],function (row) {
        if(row.length > 0) {
            cb(row);
        }else{
            cb([]);
        }
    });
}

//余额
async function findStable(wallet){
    return stable = parseInt( await db.single("select (select ifnull(sum(amount),0) from transactions where addressTo in (select address from my_addresses where wallet = ?) and result = 'good') - \n\
			(select ifnull(sum(amount + fee),0) from transactions where addressFrom in (select address from my_addresses where wallet = ?) and (result = 'good' or result = 'pending')) as stable", wallet, wallet));
}

//余额
function findStable2(wallet,cb){
    db.query("select (select ifnull(sum(amount),0) from transactions where addressTo in (select address from my_addresses where wallet = ?) and result = 'good') - \n\
			(select ifnull(sum(amount + fee),0) from transactions where addressFrom in (select address from my_addresses where wallet = ?) and (result = 'good' or result = 'pending')) as stable", [wallet, wallet] ,function (rows) {
        if(rows.length > 0) {
            cb(rows[0].stable);
        }else {
            cb(0);
        }
    });
}



//将交易列表(包括数据库中的交易记录)清空，发生的主要场景是共识网重启后，之前的交易记录会清空，本地需要同步。
async function truncateTran(addresses) {
    await iniTranList(addresses);
    let count = tranList.length;
    let cmds = [];
    if (count > 0) {
        db.addCmd(cmds, "delete from transactions where addressFrom in (?) or addressTo in (?)", addresses, addresses);
        //用队列的方式更新数据库
        await mutex.lock(["write"], async function (unlock) {
            try {
                let b_result = await db.executeTrans(cmds);
                if (!b_result) {
                    //清空列表
                    tranList = [];
                    //更新界面
                    eventBus.emit('my_transactions_became_stable');
                }
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
}
//更新已有交易记录的状态
async function updateTran(tran) {
    let id = tran.hash;
    //用队列的方式更新数据库
    await mutex.lock(["write"], async function (unlock) {
        try {
            //更新数据库
            let u_result = await db.execute("update transactions set result = 'good' where id = ?", id);
            if (u_result.affectedRows) {
                //更新列表
                refreshTranList(tran);
                //更新界面
                eventBus.emit('my_transactions_became_stable');
            }
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
//失败的交易
async function badTran(tran) {
    let id = tran.hash;
    let cmds = [];
    db.addCmd(cmds, "update transactions set result = 'final-bad' where id = ?", id);
    //用队列的方式更新数据库
    await mutex.lock(["write"], async function (unlock) {
        try {
            //更新数据库
            let b_result = await db.executeTrans(cmds);
            if (!b_result) {
                //更新列表
                refreshTranList(tran);
                //刷新界面
                eventBus.emit('my_transactions_became_stable');
            }
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

//新增一条交易记录
async function insertTran(tran) {
    console.log("\nsaving unit:");
    // console.log(JSON.stringify(tran));
    var cmds = [];
    var fields = "id, creation_date, amount, fee, addressFrom, addressTo, result";
    var values = "?,?,?,?,?,?,?";
    var params = [tran.hash, tran.time, tran.amount,tran.fee || 0, tran.fromAddress, tran.toAddress, getResultFromTran(tran)];
    db.addCmd(cmds, "INSERT INTO transactions (" + fields + ") VALUES (" + values + ")", ...params);
    //用队列的方式更新数据库
    await mutex.lock(["write"], async function (unlock) {
        try {
            //更新数据库
            let i_result = await db.executeTrans(cmds);
            if (!i_result) {
                //更新列表
                refreshTranList(tran);
                //刷新列表
                eventBus.emit('my_transactions_became_stable');
            }
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

exports.stable = stable;
exports.pending = pending;
exports.tranList = tranList;

exports.updateHistory = updateHistory;
exports.refreshTranList = refreshTranList;
exports.iniTranList = iniTranList;
exports.findStable = findStable;
exports.findTranList = findTranList;
exports.findStable2 = findStable2;