var mysql   = require('mysql');
var db  = require('./db_connection.js');

/* DATABASE CONFIGURATION */
var connection = mysql.createConnection(db.config);

/*
 create or replace view company_view as
 select s.*, a.street, a.zip_code from company s
 join address a on a.address_id = s.address_id;

 */

exports.getAll = function(callback) {
    var query = 'SELECT * FROM textbook;';

    connection.query(query, function(err, result) {
        callback(err, result);
    });
};

/*
 create or replace view textbook_authors as
 SELECT a.*, t.title, t.ISBN, t.edition FROM authors a
 JOIN textbook t on a.textbook_id = t.textbook_id;
 */


exports.getById = function(textbook_id, callback) {
    var query = 'SELECT * FROM textbook_authors WHERE textbook_id = ?'
    // var query = 'SELECT a.*, t.title, t.ISBN, t.edition FROM authors a ' +
    //     'LEFT JOIN textbook t on a.textbook_id = t.textbook_id' +
    //     'WHERE a.textbook_id = ?';
    // var query = 'SELECT t.*, a.author FROM textbook t' +
    //     'JOIN authors a ON a.textbook_id = t.textbook_id' +
    //     ' WHERE textbook_id = ?';
    var queryData = [textbook_id];
    console.log(query);

    connection.query(query, queryData, function(err, result) {

        callback(err, result);
    });
};


exports.insert = function(params, callback) {

    // FIRST INSERT THE COMPANY
    var query = 'INSERT INTO company (company_name) VALUES (?)';

    var queryData = [params.company_name];

    connection.query(query, params.company_name, function(err, result) {

        // THEN USE THE COMPANY_ID RETURNED AS insertId AND THE SELECTED ADDRESS_IDs INTO COMPANY_ADDRESS
        var company_id = result.insertId;

        // NOTE THAT THERE IS ONLY ONE QUESTION MARK IN VALUES ?
        var query = 'INSERT INTO company_address (company_id, address_id) VALUES ?';

        // TO BULK INSERT AN ARRAY OF VALUES WE CREATE A MULTIDIMENSIONAL ARRAY OF THE VALUES
        var companyAddressData = [];
        // if only one value is submitted, JavaScript will treat the value as an array, so we skip it if its not an array
        // for example if the value of params.address_id was "10", it would loop over the "1" and then the "0", instead of
        // treating it as one value.
        if(params.address_id instanceof Array) {
            for(var i=0; i < params.address_id.length; i++) {
                companyAddressData.push([company_id, params.address_id[i]]);
            }
        }
        else {
            companyAddressData.push([company_id, params.address_id]);
        }

        // NOTE THE EXTRA [] AROUND companyAddressData
        connection.query(query, [companyAddressData], function(err, result){
            callback(err, result);
        });
    });

};
/*
 exports.insert = function(params, callback) {

 // FIRST INSERT THE COMPANY
 var query = 'INSERT INTO company (company_name) VALUES (?)';

 var queryData = [params.company_name];

 connection.query(query, params.company_name, function(err, result) {

 // THEN USE THE COMPANY_ID RETURNED AS insertId AND THE SELECTED ADDRESS_IDs INTO COMPANY_ADDRESS
 var company_id = result.insertId;

 // NOTE THAT THERE IS ONLY ONE QUESTION MARK IN VALUES ?
 var query = 'INSERT INTO company_address (company_id, address_id) VALUES ?';

 // TO BULK INSERT RECORDS WE CREATE A MULTIDIMENSIONAL ARRAY OF THE VALUES
 var companyAddressData = [];
 for(var i=0; i < params.address_id.length; i++) {
 companyAddressData.push([company_id, params.address_id[i]]);
 }

 // NOTE THE EXTRA [] AROUND companyAddressData
 connection.query(query, [companyAddressData], function(err, result){
 callback(err, result);
 });
 });

 };
 */
exports.delete = function(company_id, callback) {
    var query = 'CALL company_delete(?)';
    var queryData = [company_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });

};

//declare the function so it can be used locally
var companyAddressInsert = function(company_id, addressIdArray, callback){
    // NOTE THAT THERE IS ONLY ONE QUESTION MARK IN VALUES ?
    var query = 'INSERT INTO company_address (company_id, address_id) VALUES ?';

    // TO BULK INSERT RECORDS WE CREATE A MULTIDIMENSIONAL ARRAY OF THE VALUES
    var companyAddressData = [];
    for(var i=0; i < addressIdArray.length; i++) {
        companyAddressData.push([company_id, addressIdArray[i]]);
    }
    connection.query(query, [companyAddressData], function(err, result){
        callback(err, result);
    });
};
//export the same function so it can be used by external callers
module.exports.companyAddressInsert = companyAddressInsert;

//declare the function so it can be used locally
var companyAddressDeleteAll = function(company_id, callback){
    var query = 'DELETE FROM company_address WHERE company_id = ?';
    var queryData = [company_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });
};
//export the same function so it can be used by external callers
module.exports.companyAddressDeleteAll = companyAddressDeleteAll;

exports.update = function(params, callback) {
    var query = 'UPDATE company SET company_name = ? WHERE company_id = ?';

    var queryData = [params.company_name, params.company_id];

    connection.query(query, queryData, function(err, result) {
        //delete company_address entries for this company
        companyAddressDeleteAll(params.company_id, function(err, result){

            if(params.address_id != null) {
                //insert company_address ids
                companyAddressInsert(params.company_id, params.address_id, function(err, result){
                    callback(err, result);
                });}
            else {
                callback(err, result);
            }
        });

    });
};

/*  Stored procedure used in this example
 DROP PROCEDURE IF EXISTS company_getinfo;

 DELIMITER //
 CREATE PROCEDURE company_getinfo (_company_id int)
 BEGIN

 SELECT * FROM company WHERE company_id = _company_id;

 SELECT a.*, s.company_id FROM address a
 LEFT JOIN company_address s on s.address_id = a.address_id AND company_id = _company_id
 ORDER BY a.street, a.zip_code;

 END //
 DELIMITER ;

 # Call the Stored Procedure
 CALL company_getinfo (4);

 */

exports.edit = function(company_id, callback) {
    var query = 'CALL company_getinfo(?)';
    var queryData = [company_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });
};