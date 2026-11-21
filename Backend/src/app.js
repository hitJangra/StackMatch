// express framework
const express = require("express")
// parse cookies from incoming requests
const cookieParser = require("cookie-parser")
// enable cross-origin requests
const cors = require("cors")

// initialize express instance
const app = express()

// allowed frontend urls
const allowedOrigins = [
    "http://localhost:5173", 
    "http://localhost:5174",
    ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : [])
]

// configure cors with strict origin enforcement
app.use(cors({
    origin: function (origin, callback) {
        // allow non-browser requests (tools, curl, server-to-server) or approved origins
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error("Not allowed by CORS"))
        }
    },
    // allow cookies across approved origins
    credentials: true
}))

// parse json payloads in body
app.use(express.json())
// parse cookie headers into req.cookies
app.use(cookieParser())

// load route modules
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")
const jobsRouter = require("./routes/jobs.routes")
const resumeRouter = require("./routes/resumeRoutes")

// mount api routes
app.use("/api/auth", authRouter) // auth endpoints: login, register, logout, me
app.use("/api/interview", interviewRouter) // interview report and history routes
app.use("/api/jobs", jobsRouter) // job recommendation scraper routes
app.use("/api", resumeRouter) // resume builder and pdf generator routes

// catch-all error handling middleware
app.use((err, req, res, next) => {
    // log error trace for debugging
    console.error(err.stack)
    // send error status and message back to client
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error"
    })
})

// export configured express app
module.exports = app
