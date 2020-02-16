const express = require('express')
const router = new express.Router()
const passport = require('passport')
const User = require('../models/user')



router.get('/login', (req, res) => {
    res.render('auth/login')
})

router.post('/login',passport.authenticate('local',{
    failureRedirect: '/login',
    failureFlash: 'Invalid Username or Password',
    successFlash: 'Welcome back'
}) , function(req,res){
    if(req.user.role == 'admin'){
        return res.redirect('/admin')
    }
    res.redirect('/')
});


router.get('/register', (req, res) => {
    res.render('auth/register')
})

router.post('/register', async(req, res) => {
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            console.log(err)
            return res.redirect('back')
        }
        user.email = req.body.username  
        user.firstName = req.body.firstName
        user.lastName = req.body.lastName
        user.save()
        passport.authenticate('local')(req, res, function (){
            res.redirect('/')
        })
    })
})

router.get('/recover', (req, res) => {
    res.render('auth/forgot-password')
})

router.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/login')
})

module.exports = router