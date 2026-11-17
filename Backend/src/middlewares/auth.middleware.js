// jsonwebtoken library for token verification
const jwt = require("jsonwebtoken")
// blacklist model to check logged-out tokens
const tokenBlacklistModel = require("../models/blacklist.model")

// protect routes by checking jwt cookie
async function authUser(req, res, next) {
    // extract jwt token from incoming cookies
    const token = req.cookies.token

    // reject if no token was attached
    if (!token) {
        return res.status(401).json({
            message: "Token not provided."
        })
    }

    // check if user logged out and token got blacklisted
    const isTokenBlacklisted = await tokenBlacklistModel.findOne({
        token
    })

    // deny access if token is on blacklist
    if (isTokenBlacklisted) {
        return res.status(401).json({
            message: "token is invalid"
        })
    }

    try {
        // verify token signature against secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // attach decoded payload (user id, email) to request
        req.user = decoded

        // allow request to proceed to next handler
        next()

    } catch (err) {
        // invalid signature or expired token
        return res.status(401).json({
            message: "Invalid token."
        })
    }
}

// export auth middleware
module.exports = { authUser }
