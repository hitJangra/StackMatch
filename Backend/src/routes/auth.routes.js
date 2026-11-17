// express router
const { Router } = require('express')
// auth controller functions
const authController = require("../controllers/auth.controller")
// authentication middleware
const authMiddleware = require("../middlewares/auth.middleware")

// create router instance
const authRouter = Router()

// register new user account
authRouter.post("/register", authController.registerUserController)

// sign in with email and password
authRouter.post("/login", authController.loginUserController)

// sign out and blacklist current token
authRouter.get("/logout", authController.logoutUserController)

// fetch profile of authenticated user
authRouter.get("/get-me", authMiddleware.authUser, authController.getMeController)

// update user password (protected)
authRouter.put("/update-password", authMiddleware.authUser, authController.updatePasswordController)

// export auth router
module.exports = authRouter
