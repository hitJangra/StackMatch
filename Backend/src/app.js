const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

// Middlewares
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"]
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(null, true) // Allow during local development
        }
    },
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

/* Require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")
const jobsRouter = require("./routes/jobs.routes")
const resumeRouter = require("./routes/resumeRoutes")

/* Using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/jobs", jobsRouter)
app.use("/api", resumeRouter)

/* Global error handler */
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error"
    })
})

module.exports = app
