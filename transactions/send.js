const sgMail = require('@sendgrid/mail')
const sendgridAPIKey = process.env.SENDGRID_API_KEY

sgMail.setApiKey(sendgridAPIKey)

const sendInvoiceNotification = (email, name, amount, url, title) => {
    sgMail.send({
        to: email,
        from: 'no_reply@revenue.com',
        subject: 'New Invoice Notification',
        text: `Dear ${name},
        An invoice for ${title} has been added to your account. 
        invoice amount is <span>&#8358;</span>${amount} you can login to your account to view details or you can pay now through this link ${url}`
        
    })
}
 
const sendReminder =(email, name,url,title,due)  => {
    sgMail.send({
        to:email,
        from: 'no_reply@revenue.com',
        subject: 'Payment Reminder',
        text: `Dear ${name},
        This is a reminder that your invoice for ${title} is due for payment on ${due}.
        you can pay through this link: ${url}`
    })
}
const contactAdmin = (email, subject, body) => {
    sgMail.send({
        to: 'igunnu9500@gmail.com',
        from: email,
        subject: subject,
        text: body
    })
}
module.exports ={
    sendInvoiceNotification,
    sendReminder,
    contactAdmin
}