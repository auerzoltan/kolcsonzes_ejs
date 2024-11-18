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
        db.query(`SELECT rentals.returned, rentals.rental_id, rentals.item_id, items.title, rentals.rental_date, rentals.return_date, rentals.return_due FROM rentals INNER JOIN items ON items.item_id = rentals.item_id WHERE user_id = ? ORDER BY rental_date DESC`, [req.session.userID], (err, results) => {
            if (err){
                console.log(err);
                return
            }
            
            let rents = [];
            results.forEach(item => {
                let o =  `${String(item.rental_date).split(' ')[3]}. ${String(item.rental_date).split(' ')[1]}. ${String(item.rental_date).split(' ')[2]}`;
                let k;
                if (item.return_date != null) {
                    k = `${String(item.return_date).split(' ')[3]}. ${String(item.return_date).split(' ')[1]}. ${String(item.return_date).split(' ')[2]}`;
                }
                else{
                k = `Due ${String(item.return_due).split(' ')[3]}. ${String(item.return_due).split(' ')[1]}. ${String(item.return_due).split(' ')[2]}`;
                }
                rents.push({
                    id: item.item_id,
                    rentid: item.rental_id,
                    title: item.title,
                    start: o,
                    end: k,
                    back: item.returned
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
          db.query(`UPDATE rentals SET return_date=?, returned=1 WHERE rental_id=?`, [moment().format('YYYY-MM-DD'), req.params.rid], (err, results)=>{
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
                        res.redirect('/rents');

                        return
                    });
                return
            });
            return
    }
}
)

router.get('/statistics', (req, res)=>{
    console.log("Statisztika meghívva");
    if (req.session.isLoggedIn){
        let borrowed = [];
        let away = [];
        db.query(`SELECT items.type, COUNT(rentals.item_id) AS total_rented FROM rentals JOIN items ON rentals.item_id = items.item_id GROUP BY items.type`, (err, results) => {
            if (err){
                console.log(err);
                return
            }
            results.forEach(result => {
                let obj = {};
                obj.type = result.type;
                obj.count = result.total_rented;
                borrowed.push(obj);
            });


            db.query(`SELECT items.item_id, items.title, items.type, rentals.rental_date, rentals.return_due FROM rentals JOIN items ON rentals.item_id = items.item_id WHERE rentals.returned = 0`, (err, resultss) => {
                if (err){
                    console.log(err);
                    return
                }
                resultss.forEach(result => {
                    let obj = {};
                    obj.title = result.title;
                    obj.when = `${String(result.return_due).split(' ')[3]}. ${String(result.return_due).split(' ')[1]}. ${String(result.return_due).split(' ')[2]}`;
                    away.push(obj);
                });
                console.log("Sex:");
                console.log(away);
                ejs.renderFile('./views/statistics.ejs', { session: req.session, borrowed, away }, (err, html)=>{
                    if (err){
                        console.log(err);
                        return
                    }
                    req.session.msg = '';
                    res.send(html);
                    });
                return;
            });
        return;
        });
        return;   
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