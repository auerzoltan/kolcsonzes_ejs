const express = require('express');
const ejs = require('ejs');
const { route } = require('./users');
const router = express.Router();
const db = require('./database');
const moment = require('moment');

// CORE routes
router.get('/', (req, res) => {
    ejs.renderFile('./views/index.ejs', { session: req.session }, (err, html)=>{
        if (err){
            console.log(err);
            return
        }
        req.session.msg = '';
        res.send(html);
    });
});

router.get('/reg', (req, res) => {
    ejs.renderFile('./views/regist.ejs', { session: req.session }, (err, html)=>{
        if (err){
            console.log(err);
            return
        }
        req.session.msg = '';
        res.send(html);
    });
});

router.get('/newdata', (req, res)=>{
    if (req.session.isLoggedIn){

        db.query(`SELECT title FROM items WHERE available = 1`, (err, results) => {
            if (err){
                console.log(err);
                return
            }
            let today = moment(new Date()).format('YYYY-MM-DD');
            let valasz = [];
            results.forEach(item => {
                valasz.push(item.title);
                console.log(item.title);
            });
            console.log(valasz.length);
            ejs.renderFile('./views/newdata.ejs', { session: req.session, today, valasz }, (err, html)=>{
            if (err){
                console.log(err);
                return
            }
            req.session.msg = '';
            res.send(html);
        });
        })
        
        return
    }
    res.redirect('/');
});
router.get('/rents', (req, res)=>{
    if (req.session.isLoggedIn){
        db.query(`SELECT items.title, rentals.rental_date, rentals.return_date FROM rentals INNER JOIN items ON items.item_id = rentals.item_id WHERE user_id = ? ORDER BY rental_date DESC`, [req.session.userID], (err, results) => {
            if (err){
                console.log(err);
                return
            }
            
            let rents = [];
            results.forEach(item => {
                rents.push({
                    title: item.count + ' steps',
                    start: new Date(item.date),
                    allDay: true
                });
                labels.push(`'${item.date}'`);
                datas.push(item.count);
            });
            ejs.renderFile('./views/statistics.ejs', { session: req.session, results, total, events, labels, datas }, (err, html)=>{
                if (err){
                    console.log(err);
                    return
                }
                req.session.msg = '';
                res.send(html);
            });
            return
        });
        return
    }
    res.redirect('/');
})

router.get('/statistics', (req, res)=>{
    if (req.session.isLoggedIn){

        db.query(`SELECT * FROM stepdatas WHERE userID=? ORDER BY date ASC`, [req.session.userID], (err, results) => {
            if (err){
                console.log(err);
                return
            }
            
            let events = [];
            let labels = [];
            let datas = [];

            let total = 0;
            results.forEach(item => {
                item.date = moment(item.date).format('YYYY.MM.DD.');
                total += item.count;
                events.push({
                    title: item.count + ' steps',
                    start: new Date(item.date),
                    allDay: true
                });
                labels.push(`'${item.date}'`);
                datas.push(item.count);
            });

            ejs.renderFile('./views/statistics.ejs', { session: req.session, results, total, events, labels, datas }, (err, html)=>{
                if (err){
                    console.log(err);
                    return
                }
                req.session.msg = '';
                res.send(html);
            });
            return

        });

        return
        
    }
    res.redirect('/');
});

router.get('/logout', (req, res)=>{

    req.session.isLoggedIn = false;
    req.session.userID = null;
    req.session.userName = null;
    req.session.userEmail = null;
    req.session.userRole = null;
    req.session.msg = 'You are logged out!';
    req.session.severity = 'info';
    res.redirect('/');

});

module.exports = router;