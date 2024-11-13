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

router.get('/statistics', (req, res) => {
    ejs.renderFile('./views/statistics.ejs', { session: req.session }, (err, html)=>{
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
            });
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
        db.query(`SELECT rentals.rental_id, rentals.item_id, items.title, rentals.rental_date, rentals.return_date FROM rentals INNER JOIN items ON items.item_id = rentals.item_id WHERE user_id = ? ORDER BY rental_date DESC`, [req.session.userID], (err, results) => {
            if (err){
                console.log(err);
                return
            }
            
            let rents = [];
            results.forEach(item => {
                console.log(item);
                let o =  `${String(item.rental_date).split(' ')[3]}. ${String(item.rental_date).split(' ')[1]}. ${String(item.rental_date).split(' ')[2]}`
                let k = `${String(item.return_date).split(' ')[3]}. ${String(item.return_date).split(' ')[1]}. ${String(item.return_date).split(' ')[2]}`
                rents.push({
                    id: item.item_id,
                    rentid: item.rental_id,
                    title: item.title,
                    start: o,
                    end: k
                });
            });
            ejs.renderFile('./views/rents.ejs', { session: req.session, rents }, (err, html)=>{
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

router.get('/return/:id/:rid', (req, res) =>{
    console.log("return function meghívva");
    if (req.session.isLoggedIn){
        console.log("Session...OK!");
        if (!req.params.id || !req.params.rid) {
            res.status(203).send('Hiányzó azonosító!');
            return;
        } 
          db.query(`UPDATE rentals SET return_date=? WHERE rental_id=?`, [moment().format('YYYY-MM-DD'), req.params.rid], (err, results)=>{
            console.log("Update...OK!");
                if (err){
                    req.session.msg = 'Database error! (update)';
                    req.session.severity = 'danger';
                    res.redirect('/newdata');
                    return
                }
                db.query(`UPDATE items SET available=1 WHERE item_id=?`, [req.params.id], (err, resultss)=>{
                    console.log("Update...OK!");
                        if (err){
                            req.session.msg = 'Database error! (update)';
                            req.session.severity = 'danger';
                            res.redirect('/newdata');
                            return
                        }
                        return
                    });
                return
            });
            return
    }
}
)

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