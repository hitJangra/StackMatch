// express framework
const express = require("express")
// parse cookies from incoming requests
const cookieParser = require("cookie-parser")
// enable cross-origin requests
const cors = require("cors")
const helmet = require("helmet")

// initialize express instance
const app = express()
app.set("trust proxy", 1)
app.disable("x-powered-by")
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}))

// allowed frontend urls
const allowedOrigins = [
    "http://localhost:5173", 
    "http://localhost:5174",
    "http://localhost",
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
const savedJobsRouter = require("./routes/savedJobs.routes")
const outreachRouter = require("./routes/outreach.routes")
const resumeLabRouter = require("./routes/resumeLab.routes")

// mount api routes
app.use("/api/auth", authRouter) // auth endpoints: login, register, logout, me
app.use("/api/interview", interviewRouter) // interview report and history routes
app.use("/api/jobs", jobsRouter) // job recommendation scraper routes
app.use("/api", resumeRouter) // resume builder and pdf generator routes
app.use("/api/saved-jobs", savedJobsRouter)
app.use("/api/outreach", outreachRouter) // outreach hub generation routes
app.use("/api/resume-lab", resumeLabRouter) // resume lab audit and bullet enhancer routes

// catch-all error handling middleware
app.use((err, req, res, next) => {
    // log error trace for debugging
    console.error(err.stack)
    const statusCode = err.status || 500
    const isProd = process.env.NODE_ENV === "production"

    // in production, hide internal 500 server error details to prevent data leakage
    const message = (isProd && statusCode >= 500)
        ? "Internal Server Error"
        : (err.message || "Internal Server Error")

    // send error status and message back to client
    res.status(statusCode).json({
        message
    })
})

// export configured express app
module.exports = app
