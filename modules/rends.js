const express = require('express');
const db = require('./database');
const uuid = require('uuid');
const moment = require('moment');
const router = express.Router();

// STEPS routes

router.post('/newdata', (req, res)=>{
     let { rented } = req.body;

     if (!rented) {
        req.session.msg = 'Missing data!';
        req.session.severity = 'danger';
        res.redirect('/newdata');
        return
    }

    db.query(`SELECT * FROM items WHERE title=?`, [rented], (err, results) => {
        if (err){
            req.session.msg = 'Database error! (items)';
            req.session.severity = 'danger';
            res.redirect('/newdata');
            return
        }

        if (results.length > 0){
            // update
            console.log(req.session.userID)
            db.query(`UPDATE items SET available = 0 WHERE item_id=?`, [results[0].item_id], (err, resultss)=>{
                if (err){
                    req.session.msg = 'Database error! (update)';
                    req.session.severity = 'danger';
                    res.redirect('/newdata');
                    return
                }
                db.query(`INSERT INTO rentals(user_id, item_id, rental_date, return_date) VALUES (?, ?, ?, ?)`, [req.session.userID, results[0].item_id, moment().format("YYYY.MM.DD"), moment().add(3, 'd').format("YYYY.MM.DD")], (err, resultsss) =>{
                    if (err){
                        req.session.msg = 'Database error! (insert)' + err;
                        req.session.severity = 'danger';
                        res.redirect('/newdata');
                        return
                    }
                
                    req.session.msg = 'Rents are updated!';
                    req.session.severity = 'success';
                    res.redirect('/newdata');
                    return
                })
                return
            });
        }
        return
    });
});

module.exports = router;