const mongoose = require('mongoose')

const billSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description:{
        type: String
    },
    category:{
        type:String
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    month: {
        type: String
    },
    due:{
        type: Date,
        required: true
    },
    url: {
        type: String
    },
    reference: {
        type: String
    },
    owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
}, {
    timestamps: true
})

module.exports = mongoose.model('Bill', billSchema)