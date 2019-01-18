/**
 * 
 * @type {*|{}|pool}
 */
var db = require("./db")
var async = require('async');

db.query("select unit from units where best_parent_unit='yRjP4fUjV5OjeaFtN8RSvRR3G0WJSVOFtapvFy1lELQ='",function (res) {

    // console.log(res)
});

var p_unit = "yRjP4fUjV5OjeaFtN8RSvRR3G0WJSVOFtapvFy1lELQ=";

var i = 0;
var j = 0
// p_unit ='pQOqnHJoHNzAy0iwO/Evcwh0EtB5ZzcnNYirWWIu8Mw='
// i=15
// p_unit ='Ig1AG3IxadDDmJP1k4tv5lWeKQHizg5pQaLS2JzOIzg='
// i=629
// p_unit ='+rNFYDHT5R4cmnRPsDAEAHup9HZ5WXwuxOXSBpctA4c='
// i=629


// deleteUnit1(p_unit,deleteUnit1);


function deleteUnit1(p_unit ,cb) {

    db.query("select unit from units where best_parent_unit=?",[p_unit],function(rows) {
        if(rows.length == 0) {
            db.query("delete from units WHERE unit=?",[p_unit],function (res) {
                if(res.affectedRows==1) {
                    j++;
                    console.log("刪除unit====:"+j+ "  成功!");
                    console.log("刪除unit====:"+p_unit+ "  成功!");
                }else {
                    cb(p_unit,cb);
                }

            });
        }else {
            var p_units = rows;
            p_units.forEach((uuuu)=> {
                cb(uuuu.unit,cb);
            });
        }
    });
}


deleteUnit2();


function deleteUnit2() {
    db.query("SELECT unit FROM units where level >= 1086834 ORDER BY creation_date",function (rows) {
        console.log("需要刪除unit個數===:" + rows.length);
        console.log();
        if(rows.length == 0) {
            console.log("end");
            return ;
        }
        var units = rows;

        units.forEach((row)=>{
            var ch_unit = row.unit;
            console.log("開始刪除unit======:" +ch_unit )
            db.takeConnectionFromPool(function (conn){
                var arrQueries =[];
                conn.addQuery(arrQueries, "BEGIN");
                conn.addQuery(arrQueries,"delete from witness_list_hashes where witness_list_unit = ?",[ch_unit]);
                conn.addQuery(arrQueries,"delete from earned_headers_commission_recipients where unit = ?",[ch_unit]);
                conn.addQuery(arrQueries,"delete from unit_witnesses WHERE unit = ?",[ch_unit]);
                conn.addQuery(arrQueries,"delete from authentifiers WHERE unit = ?",[ch_unit]);
                conn.addQuery(arrQueries,"delete from unit_authors WHERE unit = ?",[ch_unit]);
                conn.addQuery(arrQueries,"delete from parenthoods WHERE child_unit =?",[ch_unit]);
                conn.addQuery(arrQueries,"delete from address_definition_changes WHERE unit = ?",[ch_unit]);
                conn.addQuery(arrQueries,"delete from inputs WHERE unit =?",[ch_unit]);
                conn.addQuery(arrQueries,"delete from outputs WHERE unit = ?",[ch_unit]);
                conn.addQuery(arrQueries,"delete from spend_proofs WHERE unit =?",[ch_unit]);
                conn.addQuery(arrQueries,"delete from data_feeds WHERE unit =?",[ch_unit]);
                conn.addQuery(arrQueries,"delete from poll_choices WHERE unit=?",[ch_unit]);
                conn.addQuery(arrQueries,"delete from polls WHERE unit=?",[ch_unit]);
                conn.addQuery(arrQueries,"delete from votes where unit=?",[ch_unit]);
                conn.addQuery(arrQueries,"delete from attestations WHERE unit=?",[ch_unit]);
                conn.addQuery(arrQueries,"delete from asset_denominations WHERE asset=?",[ch_unit]);
                conn.addQuery(arrQueries,"delete from asset_attestors WHERE unit=?",[ch_unit]);
                conn.addQuery(arrQueries,"delete from assets WHERE unit=?",[ch_unit]);
                conn.addQuery(arrQueries,"delete from messages WHERE unit=?",[ch_unit]);
                // conn.addQuery(arrQueries,"delete from units WHERE unit=?",[ch_unit]);

                conn.addQuery(arrQueries, "COMMIT");
                async.series(arrQueries, function(){
                    i++;
                    console.log("刪除數量" + i);
                    console.log("開始刪除節點unit======: " + ch_unit)
                    conn.release();

                });
            })

            //
            deleteUnit1(ch_unit,deleteUnit1);


        });

    })
}