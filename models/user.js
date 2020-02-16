const mongoose = require('mongoose')
const validator =  require('validator')
const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    password: {
        type: String,
                minlength: 7,
        validate(value){
            if (validator.contains(value, 'password')) {
                throw new Error ('password must not conatin \'password \' ')
            }
        },
        trim: true
    },
    role: {
        type: String,
        default: 'user'
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)){
                throw new Error ('Email is invalid')
            }
        }
    }
}, {
    timestamps: true
})


userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', userSchema)