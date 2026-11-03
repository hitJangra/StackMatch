const mongoose = require('mongoose')


const blacklistTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [ true, "token is required to be added in blacklist" ]
    }
}, {
    timestamps: true
})

// Auto-remove blacklisted tokens after 24 hours (matching JWT expiry)
blacklistTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 })

const tokenBlacklistModel = mongoose.model("blacklistTokens", blacklistTokenSchema)


module.exports = tokenBlacklistModel