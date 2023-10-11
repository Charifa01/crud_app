// imports 
require('dotenv').config();
const { name } = require('ejs');
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 4000 ;

// midllewares 
app.use(express.json());
app.use(express.urlencoded({extended : false}))

app.use(session({
    secret: "my secret key",
    saveuninitialized: true,
    resave: false,
}))

app.use((req,res,next)=>{
    res.locals.message = req.session.message;
    delete req.session.message ;
    next();
})
app.use(express.static('./uploads'));

// the connection with the database 
mongoose.connect(process.env.mongodb_Url,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
const db = mongoose.connection;
db.on('error',(error)=>{
    console.log(error)
});
db.once('open',()=>{
    console.log('you are connecting with the database');
})

// EJS Engine 
app.set('view engine','ejs');

// route prefix
app.use('',require('./routes/userRoute'));


app.listen(PORT , () =>{
    console.log(`your server is run successfuly on port ${PORT}`);
})