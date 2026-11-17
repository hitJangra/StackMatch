// load env variables from .env
require("dotenv").config()

// import express app setup
const app = require("./src/app")
// import mongo db connection helper
const connectToDB = require("./src/config/database")

// establish database connection
connectToDB()

// start server on port 3000
app.listen(3000, () => {
    // log server status
    console.log("Server is running on port 3000")
})
