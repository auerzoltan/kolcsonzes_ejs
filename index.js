require('dotenv').config();
const express = require('express');
var session = require('express-session');

const coreRoutes = require('./modules/core');
const userRoutes = require('./modules/users');
const rendRoutes = require('./modules/rends');

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/assets', express.static('assets'));
app.use(session({ secret: process.env.SESSION_SECRET}));

// routes
app.use('/', coreRoutes);
app.use('/users', userRoutes); 
app.use('/rends', rendRoutes);


app.listen(port, ()=>{
    console.log(`Server listening on port ${port}...`);
});