const Bill = require('../models/bill')
const fetch = require('node-fetch')

verifyTransac =async (ref) => {
try{
    await fetch('https://api.paystack.co/transaction/verify/'+ ref, {
        method: 'get',
        headers: {
            'authorization': process.env.PAYSTACK_API_KEY
        }
    }).then((res) => res.json())
    .then((json) => {
        if(json.status === true && json.data.status === 'success'){
            Bill.find({reference: ref}, (err, bill)=> {
                if(err){
                   return console.log(err)
                }
                console.log(bill)
            })
        }
        else{
            console.log('failure')
        }
    })
    

}catch(err){
    console.log(err.message)
}
}

verifyTransac('3tl6059oih')