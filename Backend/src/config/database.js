// mongoose odm library
const mongoose = require("mongoose")

// connect to mongodb database
async function connectToDB() {
    try {
        // connect using connection string from env
        await mongoose.connect(process.env.MONGO_URI)
        // log success message
        console.log("Connected to Database")
    } catch (err) {
        // log connection failure
        console.log(err)
    }
}

// export db connector
module.exports = connectToDB
