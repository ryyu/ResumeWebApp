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
    var query = 'SELECT * FROM resume WHERE resume_id = ?';
    var queryData = [resume_id];

    connection.query(query, queryData, function(err, result) 
    {
        callback(err, result);
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
exports.insert = function(params, callback) {

    // FIRST INSERT THE resume
    var query = 'INSERT INTO resume (resume_name, account_id) VALUES (?, ?)';

    var queryData = [params.resume_name, params.account_id];

    // connection for multiple inserts
    
    connection.query(query, params.resume_name, function(err, result) {

        // THEN USE THE COMPANY_ID RETURNED AS insertId AND THE SELECTED ADDRESS_IDs INTO COMPANY_ADDRESS
        var resume_id = result.insertId;

        // NOTE THAT THERE IS ONLY ONE QUESTION MARK IN VALUES ?
        var query = 'INSERT INTO resume_skill (resume_id, skill_id) VALUES ?';

        // TO BULK INSERT RECORDS WE CREATE A MULTIDIMENSIONAL ARRAY OF THE VALUES
        var resumeSkillData = [];

        if (resumeSkillData instanceof Array) {
            for (var i = 0; i < params.skill_id.length; i++) {
                resumeSkillData.push([resume_id, params.skill_id[i]]);
            }
        }
        else
        {
            resumeSkillData.push([resume_id, params.skill_id[i]]);
        }

        // NOTE THE EXTRA [] AROUND companyAddressData
        connection.query(query, [resumeSkillData], function(err, result){
            //callback(err, result);
        });
    });
  

    /*

    connection.query(query, params.resume_name, function(err, result) {

        // THEN USE THE resume_ID RETURNED AS insertId AND THE SELECTED skills_IDs INTO resume_skill
        var resume_id = result.insertId;

        // NOTE THAT THERE IS ONLY ONE QUESTION MARK IN VALUES ?
        var querySkill = 'INSERT INTO resume_skill (resume_id, skill_id) VALUES ?';

        // TO BULK INSERT RECORDS WE CREATE A MULTIDIMENSIONAL ARRAY OF THE VALUES
        var resumeSkillData = [];
        for(var i=0; i < params.skill_id.length; i++) {
            resumeSkillData.push([resume_id, params.skill_id[i]]);
        }

        // NOTE THE EXTRA [] AROUND resumeSkillData
        connection.query(query, [resumeSkillData], function(err, result){
            callback(err, result);
        });
    });
    */

};


exports.delete = function(resume_id, callback) {
    var query = 'DELETE FROM resume WHERE resume_id = ?';
    var queryData = [resume_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });

};