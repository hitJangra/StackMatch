// express-rate-limit middleware
const rateLimit = require("express-rate-limit");

// Rate limit for authentication login: 10 requests per 15 minutes per IP
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many login attempts from this IP. Please try again after 15 minutes."
    }
});

// Rate limit for AI report generation and Apify scraper: 15 requests per hour per IP
const aiScraperLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Rate limit exceeded. Maximum 15 AI analyses or scraping requests per hour."
    }
});

module.exports = {
    loginLimiter,
    aiScraperLimiter
};
