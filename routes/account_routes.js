var express = require('express');
var router = express.Router();
var account_dal = require('../model/account_dal.js');


// View All Accounts
router.get('/all', function (req, res) {
    account_dal.getAll(function (err,result) {
        if(err) {
            res.send(err);
        }

        else {
            res.render('account/accountViewAll', {'result':result});
        }
    });
});

module.exports = router;