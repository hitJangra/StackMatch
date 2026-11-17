// mongoose library
const mongoose = require('mongoose')

// schema to store invalidated jwt tokens on logout
const blacklistTokenSchema = new mongoose.Schema({
    // the jwt token string to invalidate
    token: {
        type: String,
        required: [ true, "token is required to be added in blacklist" ]
    }
}, {
    // automatically track createdAt and updatedAt
    timestamps: true
})

// auto-remove expired tokens after 24 hours (86400s) to keep collection lean
blacklistTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 })

// compile model
const tokenBlacklistModel = mongoose.model("blacklistTokens", blacklistTokenSchema)

// export blacklist model
module.exports = tokenBlacklistModel
