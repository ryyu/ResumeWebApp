var mysql   = require('mysql');
var db  = require('./db_connection.js');

/* DATABASE CONFIGURATION */
var connection = mysql.createConnection(db.config);

exports.getAll = function(callback)
{
    var query = 'SELECT * FROM resume_account_info;';

    connection.query(query, function(err, result) 
    {
        callback(err, result);
    });
};

exports.getById = function(resume_id, callback) 
{
    var query = 'SELECT * FROM resume_view WHERE resume_id = ?';
    var queryData = [resume_id];

    connection.query(query, queryData, function(err, result) 
    {
        callback(err, result);
    });
};

//This is gonna work this time
exports.insert = function(params, callback) {

    // FIRST INSERT THE COMPANY
    var query = 'INSERT INTO resume (resume_name, account_id) VALUES (?, ?)';

    var queryData = [params.resume_name, params.account_id];

    connection.query(query, queryData, function (err, result) {

        // THEN USE THE COMPANY_ID RETURNED AS insertId AND THE SELECTED ADDRESS_IDs INTO COMPANY_ADDRESS
        var resume_id = result.insertId;

        var query = 'INSERT INTO resume_skill (resume_id, skill_id) VALUES ?';

        // NOTE THAT THERE IS ONLY ONE QUESTION MARK IN VALUES ?ARRAY OF THE VALUES
        var resumeSkillData = [];
        // if only one value is submitted, JavaScript will treat the value as an array, so we skip it if its not an array
        // for example if the value of params.address_id was "10", it would loop over the "1" and then the "0", instead of
        // treating it as one value.
        if (params.skill_id instanceof Array) {
            for (var i = 0; i < params.skill_id.length; i++) {
                resumeSkillData.push([resume_id, params.skill_id[i]]);
            }
        }

        // TO BULK INSERT AN ARRAY OF VALUES WE CREATE A MULTIDIMENSIONAL
        else {
            resumeSkillData.push([resume_id, params.skill_id]);
        }

        // connection.query(query, [resumeSkillData], function (err, result) {
        //
        //     callback(err, result);
        // });

        // NOTE THE EXTRA [] AROUND companyAddressData
        connection.query(query, [resumeSkillData], function (err, result) {

            //second nest
            //connection.query(query, queryData, function (err, result) {
                var resume_id = result.insertId;

                var query = 'INSERT INTO resume_company (resume_id, company_id) VALUES ?';

                var resumeCompanyData = [];

                if (params.company_id instanceof Array) {
                    for (var i = 0; i < params.company_id.length; i++) {
                        resumeCompanyData.push([resume_id, params.company_id[i]]);
                    }
                }
                else {
                    resumeCompanyData.push([resume_id, params.company_id]);
                }
                //callback(err, result);
                connection.query(query, [resumeCompanyData], function (err, result) {

                        //third nest
                        //connection.query(query, queryData, function (err, result) {
                        var resume_id = result.insertId;

                        var query = 'INSERT INTO resume_school (resume_id, school_id) VALUES ?';

                        var resumeSchoolData = [];

                        if (params.school_id instanceof Array) {
                            for (var i = 0; i < params.school_id.length; i++) {
                                resumeSchoolData.push([resume_id, params.school_id[i]]);
                            }
                        }
                        else {
                            resumeSchoolData.push([resume_id, params.school_id]);
                        }
                        //callback(err, result);
                        connection.query(query, [resumeSchoolData], function (err, result) {

                            callback(err, result);
                        });
                });
        });
    });
};



/*
exports.insert = function(params, callback) {
    var query = 'INSERT INTO resume (resume_name, account_id) VALUES (?, ?)';

    // the question marks in the sql query above will be replaced by the values of the
    // the data in queryData
    var queryData = [params.resume_name, params.account_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });

};
*/

/*
 DROP PROCEDURE IF EXISTS resume_delete;

 DELIMITER //
 CREATE PROCEDURE resume_delete (_resume_id int)
 BEGIN
 DELETE FROM resume_company WHERE resume_id = _resume_id;
 DELETE FROM resume_skill WHERE resume_id = _resume_id;
 DELETE FROM resume_school WHERE resume_id = _resume_id;
 DELETE FROM resume WHERE resume_id = _resume_id;
 END //
 DELIMITER ;

 */


exports.delete = function(resume_id, callback) {
    //var query = 'DELETE FROM resume WHERE resume_id = ?';
    console.log(resume_id);
    var query = 'CALL resume_delete(?)'
    var queryData = [resume_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });

};





//declare the function so it can be used locally
var resumeSkillInsert = function(resume_id, skillIdArray, callback){
    // NOTE THAT THERE IS ONLY ONE QUESTION MARK IN VALUES ?
    var query = 'INSERT INTO resume_skill (resume_id, skill_id) VALUES ?';

    // TO BULK INSERT RECORDS WE CREATE A MULTIDIMENSIONAL ARRAY OF THE VALUES
    var resumeSkillData = [];
    for(var i=0; i < skillIdArray.length; i++) {
        resumeSkillData.push([resume_id, skillIdArray[i]]);
    }
    connection.query(query, [resumeSkillData], function(err, result){
        callback(err, result);
    });
};
//export the same function so it can be used by external callers
module.exports.resumeSkillInsert = resumeSkillInsert;

//declare the function so it can be used locally
var resumeSkillDeleteAll = function(resume_id, callback){
    var query = 'DELETE FROM resume_skill WHERE resume_id = ?';
    var queryData = [resume_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });
};
//export the same function so it can be used by external callers
module.exports.resumeSkillDeleteAll = resumeSkillDeleteAll;







var resumeSchoolInsert = function(resume_id, schoolIdArray, callback){

    var query = 'INSERT INTO resume_school (resume_id, school_id) VALUES ?';

    var resumeSchoolData = [];
    for(var i=0; i < schoolIdArray.length; i++) {
        resumeSchoolData.push([resume_id, schoolIdArray[i]]);
    }
    connection.query(query, [resumeSchoolData], function(err, result){
        callback(err, result);
    });
};
//export the same function so it can be used by external callers
module.exports.resumeSchoolInsert = resumeSchoolInsert;

var resumeSchoolDeleteAll = function(resume_id, callback){
    var query = 'DELETE FROM resume_school WHERE resume_id = ?';
    var queryData = [resume_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });
};
//export the same function so it can be used by external callers
module.exports.resumeSchoolDeleteAll = resumeSchoolDeleteAll;





var resumeCompanyInsert = function(resume_id, companyIdArray, callback){

    var query = 'INSERT INTO resume_company (resume_id, company_id) VALUES ?';

    var resumeCompanyData = [];
    for(var i=0; i < companyIdArray.length; i++) {
        resumeCompanyData.push([resume_id, companyIdArray[i]]);
    }
    connection.query(query, [resumeCompanyData], function(err, result){
        callback(err, result);
    });
};
//export the same function so it can be used by external callers
module.exports.resumeCompanyInsert = resumeCompanyInsert;

var resumeCompanyDeleteAll = function(resume_id, callback){
    var query = 'DELETE FROM resume_company WHERE resume_id = ?';
    var queryData = [resume_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });
};
//export the same function so it can be used by external callers
module.exports.resumeCompanyDeleteAll = resumeCompanyDeleteAll;









exports.update = function(params, callback) {
    var query = 'UPDATE  SET resume_name = ? WHERE resume_id = ?';

    var queryData = [params.resume_name, params.resume_id];

    connection.query(query, queryData, function(err, result) {
        //delete company_address entries for this company
        resumeSkillDeleteAll(params.resume_id, function(err, result){

            if(params.skill_id != null) {
                //insert company_address ids
                resumeSkillInsert(params.resume_id, params.skill_id, function(err, result){
                    //second nest for school

                    resumeSchoolDeleteAll(params.resume_id, function(err, result){

                        if(params.school_id != null) {
                            //insert resume_school ids
                            resumeSchoolInsert(params.resume_id, params.school_id, function(err, result){

                                //third nest for company
                                resumeCompanyDeleteAll(params.resume_id, function(err, result){

                                    if(params.comany_id != null) {
                                        //insert resume_school ids
                                        resumeCompanyInsert(params.resume_id, params.company_id, function(err, result){
                                            callback(err, result);

                                        });}
                            });});}
                });});}
            //else {
              //  callback(err, result);
            //}
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

exports.edit = function(resume_id, callback) {
    var query = 'SELECT * FROM resume_account_info;';
    var queryData = [resume_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });
};