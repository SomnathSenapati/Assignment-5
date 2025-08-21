
require('dotenv').config()
const express=require("express")
const cors=require('cors')
const ejs=require('ejs')
const dbCon=require('./app/config/dbCon')
const path=require('path')
const fs=require('fs')
const methodOverride = require('method-override');
const session = require('express-session');

dbCon()
const app=express()
app.use(cors())
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src * 'self' data: blob:;");
    next();
});

app.use(session({
  secret: 'myquizsecret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } 
}));


app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'));

app.set("view engine", "ejs")
app.set("views", "views")

app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

//auth route
const userAuthRoues=require('./app/routes/userAuthRoutes')
app.use ('/api/user',userAuthRoues)
//movie route
const movieRoute = require('./app/routes/movieRoutes')
app.use( '/api/movie',movieRoute)
//theater route

const theaterRoute=require('./app/routes/theaterRoutes')
app.use('/api/theater',theaterRoute)

//booking route
const bookingRoutes=require('./app/routes/bookingRoutes')
app.use('/api/ticket',bookingRoutes)

const PORT=process.env.PORT || 2809

app.listen(PORT,()=>{
    console.log("sever is running at port:",PORT)
})