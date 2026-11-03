const { ApifyClient } = require("apify-client")

// Initialise once – token is read from environment at startup.
const apifyClient = new ApifyClient({
    token: process.env.APIFY_API_TOKEN
})

/**
 * Apify actor IDs for job-board scrapers.
 * Switch ACTIVE_ACTOR to "naukri" to target Naukri.com instead.
 */
const ACTORS = {
    linkedin: "curious_coder/linkedin-jobs-scraper",
    naukri:   "bebity/naukri-jobs-scraper"
}

const ACTIVE_ACTOR = "linkedin"

/**
 * @description Maps a raw Apify item from the LinkedIn scraper into a
 *              clean, normalised job object for the frontend.
 * @param {Object} item - Raw dataset item returned by Apify.
 * @returns {{ title, company, location, url, description }}
 */
function normaliseJob(item) {
    return {
        title:       item.title           || item.jobTitle        || item.positionName || "N/A",
        company:     item.companyName     || item.company          || item.organization || "N/A",
        location:    item.location        || item.jobLocation      || "N/A",
        url:         item.link            || item.applyUrl         || item.url          || item.jobUrl || "#",
        description: item.descriptionText || item.description      || item.descriptionHtml || item.jobDescription || item.snippet || ""
    }
}

/**
 * @route  POST /api/jobs/recommend
 * @desc   Accepts an array of job keywords, runs an Apify scraper for each
 *         keyword, and returns up to 5 normalised job listings per keyword
 *         (capped at 15 total).
 * @access Private
 * @body   { keywords: string[] }
 */
async function recommendJobsController(req, res, next) {
    try {
        const { keywords } = req.body

        if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
            return res.status(400).json({
                message: "keywords must be a non-empty array of strings."
            })
        }

        // Clamp to first 3 keywords to avoid excessive Apify usage.
        const safeKeywords = keywords.slice(0, 3)

        // Run one Apify actor call per keyword in parallel.
        const scrapeResults = await Promise.allSettled(
            safeKeywords.map((keyword) =>
                apifyClient.actor(ACTORS[ACTIVE_ACTOR]).call(
                    {
                        // LinkedIn scraper input schema
                        urls: [
                            `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keyword)}`
                        ],
                        count: 5
                    },
                    { waitSecs: 90 }
                )
            )
        )

        const allJobs = []

        for (const result of scrapeResults) {
            if (result.status !== "fulfilled") {
                // Log but don't crash – partial results are still useful.
                console.error("[jobs/recommend] Apify actor call failed:", result.reason)
                continue
            }

            const { defaultDatasetId } = result.value
            const { items } = await apifyClient.dataset(defaultDatasetId).listItems({ limit: 5 })

            for (const item of items) {
                // Skip error response objects from actor
                if (item && !item.error && (item.title || item.link)) {
                    allJobs.push(normaliseJob(item))
                }
            }
        }

        // Deduplicate by URL and cap at 15 cards.
        const seen  = new Set()
        const jobs  = []
        for (const job of allJobs) {
            if (!seen.has(job.url)) {
                seen.add(job.url)
                jobs.push(job)
                if (jobs.length >= 15) break
            }
        }

        res.status(200).json({
            message: "Job recommendations fetched successfully.",
            jobs
        })
    } catch (err) {
        next(err)
    }
}

module.exports = { recommendJobsController }
