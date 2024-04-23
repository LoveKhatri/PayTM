const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/paytm')

const User = mongoose.model('user', {
    username: String,
    firstName: String,
    lastName: String,
    password: String
})

module.exports = {
    User
}