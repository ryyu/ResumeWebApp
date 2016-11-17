var mysql  = require('mysql');
var db = require('./db_connection.js');

// database config
var connection = mysql.createConnection(db.config);

exports.getAll = function(callback)
{
    var query = 'SELECT * FROM account';
    
    connection.query(query, function(err, result)
    {
        callback(err, result);
    });
    
};

