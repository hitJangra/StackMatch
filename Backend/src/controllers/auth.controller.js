// user model for database operations
const userModel = require("../models/user.model")
// bcrypt for hashing and comparing passwords
const bcrypt = require("bcryptjs")
// jwt for creating auth tokens
const jwt = require("jsonwebtoken")
// blacklist model to store invalidated tokens
const tokenBlacklistModel = require("../models/blacklist.model")

// handles new user signup
async function registerUserController(req, res, next) {
    try {
        // grab fields from request body
        const { username, email, password } = req.body

        // ensure all required fields are present
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Please provide username, email and password"
            })
        }

        // validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({
                message: "Please provide a valid email address"
            })
        }

        // validate minimum password length
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long"
            })
        }

        // check if username or email is already taken
        const isUserAlreadyExists = await userModel.findOne({
            $or: [ { username }, { email } ]
        })

        // return error if already registered
        if (isUserAlreadyExists) {
            return res.status(400).json({
                message: "Account already exists with this email address or username"
            })
        }

        // salt and hash password with bcrypt
        const hash = await bcrypt.hash(password, 10)

        // save new user to database
        const user = await userModel.create({
            username,
            email,
            password: hash
        })

        // generate jwt valid for 1 day
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        // set secure auth cookie
        res.cookie("token", token, {
            httpOnly: true, // prevent xss access
            secure: process.env.NODE_ENV === "production", // https only in prod
            sameSite: "lax", // protect against csrf
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        })

        // return created user info without password
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (err) {
        // pass error to global handler
        next(err)
    }
}

// handles user login
async function loginUserController(req, res, next) {
    try {
        // get login credentials
        const { email, password } = req.body

        // look up user by email
        const user = await userModel.findOne({ email })

        // fail if user doesn't exist
        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        // compare plain password with stored hash
        const isPasswordValid = await bcrypt.compare(password, user.password)

        // fail if password doesn't match
        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        // generate session jwt
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        // store token in http-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        })

        // send success response with user profile
        res.status(200).json({
            message: "User loggedIn successfully.",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (err) {
        // forward error
        next(err)
    }
}

// handles user logout
async function logoutUserController(req, res, next) {
    try {
        // pull token from cookie
        const token = req.cookies.token

        // blacklist current token if present
        if (token) {
            await tokenBlacklistModel.create({ token })
        }

        // wipe cookie from browser
        res.clearCookie("token")

        // respond with logout success
        res.status(200).json({
            message: "User logged out successfully"
        })
    } catch (err) {
        // forward error
        next(err)
    }
}

// fetch current user info
async function getMeController(req, res, next) {
    try {
        // find user in db using id from auth middleware
        const user = await userModel.findById(req.user.id)

        // return user data
        res.status(200).json({
            message: "User details fetched successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (err) {
        // forward error
        next(err)
    }
}

// update account password
async function updatePasswordController(req, res, next) {
    try {
        // extract old and new passwords
        const { currentPassword, newPassword } = req.body

        // check both passwords are provided
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Please provide both current password and new password."
            })
        }

        // validate minimum length
        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "New password must be at least 6 characters long."
            })
        }

        // fetch user record
        const user = await userModel.findById(req.user.id)
        if (!user) {
            return res.status(404).json({
                message: "User not found."
            })
        }

        // verify current password matches db hash
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Current password is incorrect."
            })
        }

        // hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        // update and save
        user.password = hashedPassword
        await user.save()

        // send confirmation
        res.status(200).json({
            message: "Password updated successfully."
        })
    } catch (err) {
        // forward error
        next(err)
    }
}

// export controller handlers
module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController,
    updatePasswordController
}
