// mongoose library
const mongoose = require("mongoose")

// define schema for registered users
const userSchema = new mongoose.Schema({
    // unique username
    username: {
        type: String,
        unique: [ true, "username already taken" ],
        required: true,
    },

    // unique email address
    email: {
        type: String,
        unique: [ true, "Account already exists with this email address" ],
        required: true,
    },

    // hashed password string
    password: {
        type: String,
        required: true
    }
})

// compile user schema into model
const userModel = mongoose.model("users", userSchema)

// export model for auth controller
module.exports = userModel
