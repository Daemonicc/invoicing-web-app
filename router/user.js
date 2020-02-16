const express = require('express')
const router = new express.Router()
const passport = require('passport')
const User = require('../models/user')
const auth = require('../middleware/index')
const Bill = require('../models/bill')
const fetch = require('node-fetch')
const {contactAdmin} = require('../transactions/send')

router.get('/', auth.isLoggedIn, async(req, res) => {
    res.render('users/index')
})
router.get('/me', auth.isLoggedIn, (req, res) => {
    res.render('users/profile')
})

router.get('/invoice/:id', auth.isLoggedIn, async (req, res) => {
    const invoice = await Bill.findById(req.params.id).exec()

    try{
        await fetch('https://api.paystack.co/transaction/verify/'+ invoice.reference, {
            method: 'get',
            headers: {
                'authorization': 'Bearer sk_test_dd97125d29c0b996f4d906a37107ee985fc13db7'
            }
        }).then((res) => res.json())
        .then((json) => {
            console.log(json)
            if(json.status === true && json.data.status === 'success'){
                Bill.findOneAndUpdate({reference:invoice.reference}, {isPaid : true}, (err, bill)=>{
                    if(err){
                        return(err)
                    }
                })
            }
            res.render('users/invoice', {invoice})
        })
        
    }catch(err){
        console.log(err) 
    }
    
})
router.get('/invoice', auth.isLoggedIn, async (req, res) => {
    const invoices = await Bill.find({owner: req.user._id}).exec()
    res.render('users/list-invoice', {invoices: invoices})
})

router.get('/debts', auth.isLoggedIn, async (req, res) => {
    const invoices = await Bill.find({$and :[{
        owner: req.user._id,
        isPaid: false
    }]}).exec()
    res.render('users/debts', {invoices: invoices})
})
router.get('/verify/:id',auth.isLoggedIn, async (req, res) => {
    try{
        await fetch('https://api.paystack.co/transaction/verify/'+ req.params.id, {
            method: 'get',
            headers: {
                'authorization': 'Bearer sk_test_dd97125d29c0b996f4d906a37107ee985fc13db7'
            }
        }).then((res) => res.json())
        .then((json) => {
            console.log(json)
            if(json.status === true && json.data.status === 'success'){
                Bill.findOneAndUpdate({reference:req.params.id}, {isPaid : true}, (err, bill)=>{
                    if(err){
                        return(err)
                    }
                })
                console.log('payment successful')
                req.flash('success', 'Invoice Paided')
                return res.redirect('back')
            }
            req.flash('error', 'Invoice not yet Paid')
            res.redirect('back') 
        })
        

    }catch(err){
        console.log(err)
        req.flash('error', err.message)
        res.redirect('back') 
    }
})

router.get('/complain',auth.isLoggedIn, (req, res) => {
    res.render('users/contact')
})

router.post('/complain',auth.isLoggedIn, (req, res) => {
    contactAdmin(req.user.email, req.body.subject, req.body.body)
    req.flash("success", "Complaint Sent check your email for reply")
    res.redirect('back')
})
module.exports = router