var mysql  = require('mysql');

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    port: '3306',
    database: 'test',
});

connection.connect();

var modSql = 'UPDATE user SET name = ?,sex = ? WHERE id = ?';
var modSqlParams = ['haha', 'https',1];
//改
connection.query(modSql,modSqlParams,function (err, result) {
    if(err){
        console.log('[UPDATE ERROR] - ',err.message);
        return;
    }
    console.log('--------------------------UPDATE----------------------------');
    console.log('UPDATE affectedRows',result.affectedRows);
    console.log('-----------------------------------------------------------------\n\n');
});

connection.end();