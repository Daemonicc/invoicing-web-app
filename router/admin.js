const express = require('express')
const router = new express.Router()
const passport = require('passport')
const User = require('../models/user')
const auth = require('../middleware/index')
const Bill = require('../models/bill')
const { sendInvoiceNotification } = require('../transactions/send')
const fetch = require('node-fetch')



router.get('/admin', auth.isAdmin, async (req, res) => {
    let rentAmount = 0
    let taxAmount = 0
    let fineAmount = 0
    let billsAmount = 0

    const bills = await Bill.find({$and : [{
        isPaid: true
    }]
    
})
const userCount = await User.count({}).exec()
const debtCount = await Bill.count({isPaid: false}).exec()
const rents = await Bill.find({$and : [{
        isPaid: true,
        category: 'rent'
    }]
    
})
const taxes = await Bill.find({$and : [{
    isPaid: true,
    category: 'tax'
}]
})
const fines = await Bill.find({$and : [{
    isPaid: true,
    category: 'fine'
}]
})

rents.forEach((rent) => rentAmount += rent.amount)
fines.forEach((fine) => fineAmount += fine.amount)
taxes.forEach((tax) => taxAmount += tax.amount)
bills.forEach((bill) => billsAmount += bill.amount)
    res.render('admin/dashboard', {rentAmount, taxAmount, fineAmount, billsAmount, userCount, debtCount})
})

router.get('/users', auth.isAdmin, async (req, res) => {
    User.find({role: 'user'}, function(err, users){
        if (err){
            res.flash('error', err)
        }
        res.render('admin/users', {users: users})
    })
})

router.get('/bill/:id', auth.isAdmin, (req, res) => {
    res.render('admin/bill', {user: req.params.id})
})
router.post('/bill/:id', async(req, res) => {
    const bill = new Bill({
        ...req.body,
        owner: req.params.id
    })
    

    const user = await User.findById(req.params.id).exec()

    const body = {
        'amount': Number(req.body.amount*100),
        'email': user.email,
        'bearer': 'account'  
    }

    try{
        await bill.save()
        await fetch('https://api.paystack.co/transaction/initialize/', {
            method: 'post',
            headers: {
                'authorization': 'Bearer sk_test_dd97125d29c0b996f4d906a37107ee985fc13db7', 
                'content-type': 'application/json'},
            body: JSON.stringify(body)
        }).then((res) => res.json())
        .then((json) => {
            if(json.status == false){
                req.flash('error', err.message)
                return res.redirect('back')  
            }
            bill.url = json.data.authorization_url
            bill.reference = json.data.reference
            bill.save()
            sendInvoiceNotification(user.email, user.firstName, req.body.amount, json.data.authorization_url, req.body.title)
        })
        
        req.flash('success', 'bill created successfully')
        res.redirect('back')
    }
    catch (err){
        req.flash('error', err.message)
        res.redirect('back')
    }
})

router.get('/reports', auth.isAdmin, (req, res) => {
    res.render('admin/reports')
})

router.post('/reports', auth.isAdmin, async (req, res) => {
    const start = new Date(req.body.start).toISOString()
    const end = new Date(req.body.stop).toISOString()

    const bills = await Bill.find( {$and : [{
                createdAt: {
                $gte: start,
                $lte: end
                }
            }
        ]
    }).populate('owner').exec()
    let billsAmount = 0
    let paidAmount = 0
    const paidBills = bills.filter(bill => bill.isPaid == true)
    bills.forEach((bill) => billsAmount += bill.amount)
    paidBills.forEach((bill) => paidAmount += bill.amount)
    const debts = billsAmount - paidAmount

    console.log(billsAmount)
    console.log(paidAmount)
    res.render('admin/report', {invoices: bills, totalAmount: billsAmount, paidAmount, debts,start, end})   
})

router.get('/pending', auth.isAdmin, async (req, res) => {
    const invoices = await Bill.find({isPaid: false}).populate('owner').exec()

    res.render('admin/debts', {invoices})
})
module.exports = router