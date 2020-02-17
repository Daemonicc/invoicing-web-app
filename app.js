const express = require('express')
const bodyParser = require('body-parser')
const flash = require('connect-flash-plus')
const adminRoute = require('./router/admin')
const authRoute = require('./router/auth')
const usersRoute = require('./router/user')
const passport = require('passport')
const localStrategy = require('passport-local')
const User = require('./models/user')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()

const port = process.env.PORT || 3000

app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs')

mongoose.connect('mongodb://localhost:27017/project', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true});


app.use(bodyParser.urlencoded({extended: true}))

app.use(require('express-session')({
    secret: 'Final Year Project',
    resave: false,
    saveUninitialized: false
  }))

  app.use(flash())
  app.use(passport.initialize());
  app.use(passport.session());
  

  app.use(function(req, res, next){
    res.locals.currentUser = req.user
    res.locals.error = req.flash("error")
    res.locals.success = req.flash("success")
    next()
  })
  
  passport.use(new localStrategy(User.authenticate()));
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());

app.use(authRoute)
app.use(adminRoute)
app.use(usersRoute)



app.get('*', function(req, res){
  res.render('404')
})
app.listen(port, () => {
    console.log('Serving on at port' + port)
})