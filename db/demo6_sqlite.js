
var db = require("./db")
var async = require('async');

db.query("select unit from units where best_parent_unit='yRjP4fUjV5OjeaFtN8RSvRR3G0WJSVOFtapvFy1lELQ='",function (res) {

    console.log(res)
});

var p_unit = "yRjP4fUjV5OjeaFtN8RSvRR3G0WJSVOFtapvFy1lELQ=";
var i = 0;

deleteUnit(p_unit,deleteUnit);


function deleteUnit(unit ,cb) {

    db.query("select unit from units where best_parent_unit=?",[unit],function(rows) {
        if(rows.length == 0) {
            console.log(i);
            console.log("end")
            return;
        }else {
            var units = rows;
            units.forEach((row)=>{
                var ch_unit = row.unit;
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
                        console.log("刪除unit====:"+ch_unit+ "  成功!");
                        console.log("開始刪除節點unit======: " + row.unit)
                        conn.release();
                        cb(row.unit,cb);
                    });
                })


            });

        }



    });


}