// apify client library for web scraping actors
const { ApifyClient } = require("apify-client")
// cached jobs model to avoid duplicate scraper runs
const CachedJobs = require("../models/cachedJobs.model")

const sanitizeStr = (val) => (typeof val === "string" ? val.trim() : "")
const isInvalidType = (val) => val !== undefined && val !== null && typeof val !== "string"

// initialize apify client with api token from env
const apifyClient = new ApifyClient({
    token: process.env.APIFY_API_TOKEN
})

// actor identifiers for scrapers
const ACTORS = {
    linkedin: "curious_coder/linkedin-jobs-scraper",
    naukri:   "bebity/naukri-jobs-scraper"
}

// active scraper selection
const ACTIVE_ACTOR = "linkedin"

// generate a human-readable filter-aware query key
// e.g. "react-developer::india::fresher::internship"
function generateQueryKey(keywords, filters = {}) {
    // normalize keywords segment
    const kwSegment = keywords
        .map((k) => String(k).trim().toLowerCase().replace(/\s+/g, "-"))
        .filter(Boolean)
        .sort()
        .join("+")

    // normalize filter segments (use "any" as placeholder when not set)
    const loc = (filters.location || "india").trim().toLowerCase().replace(/\s+/g, "-")
    const exp = (filters.experience || "any").trim().toLowerCase()
    const type = (filters.type || "any").trim().toLowerCase()

    return `${kwSegment}::${loc}::${exp}::${type}`
}

// legacy cache key — keywords only, for backward compatibility lookups
function generateLegacyCacheKey(keywords) {
    return keywords
        .map((k) => String(k).trim().toLowerCase())
        .filter(Boolean)
        .sort()
        .join("::")
}

// transform raw apify scraper item to clean frontend format
function normaliseJob(item) {
    return {
        // extract title with fallbacks
        title:       item.title           || item.jobTitle        || item.positionName || "N/A",
        // extract company name
        company:     item.companyName     || item.company          || item.organization || "N/A",
        // extract job location
        location:    item.location        || item.jobLocation      || "N/A",
        // extract application link
        url:         item.link            || item.applyUrl         || item.url          || item.jobUrl || "#",
        // extract description or snippet
        description: item.descriptionText || item.description      || item.descriptionHtml || item.jobDescription || item.snippet || ""
    }
}

// build a linkedin search url enriched with filter parameters
function buildLinkedInUrl(keyword, filters = {}) {
    const base = "https://www.linkedin.com/jobs/search/"
    const params = new URLSearchParams()

    // keyword query
    params.set("keywords", keyword)

    // location filter — append to URL for LinkedIn geo-search
    if (filters.location && filters.location.toLowerCase() !== "any") {
        params.set("location", filters.location)
    }

    // experience level filter — LinkedIn f_E codes:
    // 1 = Internship, 2 = Entry, 3 = Associate, 4 = Mid-Senior, 5 = Director, 6 = Executive
    const expMap = {
        fresher:  "1,2",   // Internship + Entry Level
        mid:      "3,4",   // Associate + Mid-Senior
        senior:   "5,6"    // Director + Executive
    }
    if (filters.experience && expMap[filters.experience]) {
        params.set("f_E", expMap[filters.experience])
    }

    // job type filter — LinkedIn f_JT codes:
    // F = Full-time, I = Internship, C = Contract, P = Part-time
    const typeMap = {
        "full-time":  "F",
        "internship": "I",
        "contract":   "C",
        "part-time":  "P"
    }
    if (filters.type && typeMap[filters.type]) {
        params.set("f_JT", typeMap[filters.type])
    }

    return `${base}?${params.toString()}`
}

// handle job recommendations based on keywords + pre-fetch filters
async function recommendJobsController(req, res, next) {
    try {
        // get keywords array from request body
        const { keywords } = req.body || {}

        // validate keywords input
        if (!keywords || !Array.isArray(keywords) || keywords.length === 0 || !keywords.every(k => typeof k === "string" && k.trim())) {
            return res.status(400).json({
                message: "keywords must be a non-empty array of strings."
            })
        }

        const rawLoc = req.query.location !== undefined ? req.query.location : (req.body && req.body.location)
        const rawExp = req.query.exp !== undefined ? req.query.exp : (req.body && req.body.exp)
        const rawType = req.query.type !== undefined ? req.query.type : (req.body && req.body.type)

        if (isInvalidType(rawLoc) || isInvalidType(rawExp) || isInvalidType(rawType)) {
            return res.status(400).json({
                message: "Filter parameters (location, exp, type) must be strings."
            })
        }

        // read optional pre-fetch filter query params
        const filters = {
            location:   sanitizeStr(rawLoc) || "India",
            experience: sanitizeStr(rawExp) || "any",
            type:       sanitizeStr(rawType) || "any"
        }

        // take top 3 keywords to keep scraper execution fast and cheap
        const safeKeywords = keywords.slice(0, 3)

        // generate filter-aware cache key (primary lookup)
        const queryKey    = generateQueryKey(safeKeywords, filters)
        // legacy keywords-only key (backward compat)
        const cacheKey    = generateLegacyCacheKey(safeKeywords)

        console.log(`[jobs/recommend] queryKey="${queryKey}" filters=`, filters)

        // ── cache check ────────────────────────────────────────────────
        const cachedEntry = await CachedJobs.findOne({ queryKey })
        if (cachedEntry && cachedEntry.jobs && cachedEntry.jobs.length > 0) {
            console.log(`[jobs/recommend] Cache HIT for queryKey="${queryKey}"`)
            // associate current user with cached results so it appears in their past recommendations
            const userId = req.user?.id || req.user?._id;
            if (userId) {
                try {
                    await CachedJobs.updateOne(
                        { _id: cachedEntry._id },
                        { $addToSet: { users: userId } }
                    );
                } catch (updateErr) {
                    console.error("[jobs/recommend] Failed to associate user with cached entry:", updateErr.message);
                }
            }

            return res.status(200).json({
                message: "Job recommendations fetched successfully.",
                jobs: cachedEntry.jobs,
                cached: true,
                queryKey
            })
        }

        console.log(`[jobs/recommend] Cache MISS — running Apify scraper`)

        // ── cache miss: scrape jobs using apify in parallel ─────────────
        const scrapeResults = await Promise.allSettled(
            safeKeywords.map((keyword) =>
                apifyClient.actor(ACTORS[ACTIVE_ACTOR]).call(
                    {
                        // build filter-enriched linkedin search url
                        urls: [ buildLinkedInUrl(keyword, filters) ],
                        count: 5 // scrape 5 items per keyword
                    },
                    { waitSecs: 90 } // timeout after 90 seconds
                )
            )
        )

        // collect all scraped results
        const allJobs = []

        // process actor execution results
        for (const result of scrapeResults) {
            // skip failed runs
            if (result.status !== "fulfilled") {
                console.error("[jobs/recommend] Apify actor call failed:", result.reason)
                continue
            }

            // fetch dataset items produced by the actor
            const { defaultDatasetId } = result.value
            const { items } = await apifyClient.dataset(defaultDatasetId).listItems({ limit: 5 })

            // normalize and collect jobs
            for (const item of items) {
                if (item && !item.error && (item.title || item.link)) {
                    allJobs.push(normaliseJob(item))
                }
            }
        }

        // deduplicate listings by link
        const seen  = new Set()
        const jobs  = []
        for (const job of allJobs) {
            if (!seen.has(job.url)) {
                seen.add(job.url)
                jobs.push(job)
                // limit total to 15 listings
                if (jobs.length >= 15) break
            }
        }

        // ── persist to mongodb cache ──────────────────────────────────
        if (jobs.length > 0) {
            try {
                const userId = req.user?.id || req.user?._id;
                await CachedJobs.findOneAndUpdate(
                    { queryKey },
                    {
                        $setOnInsert: {
                            queryKey,
                            cacheKey,
                            keywords: safeKeywords,
                            filters,
                            createdAt: new Date()
                        },
                        $set: {
                            jobs
                        },
                        ...(userId ? { $addToSet: { users: userId } } : {})
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                )
                console.log(`[jobs/recommend] Cached ${jobs.length} jobs under queryKey="${queryKey}"`)
            } catch (cacheErr) {
                // non-fatal — log and continue
                console.error("[jobs/recommend] Failed to cache Apify results:", cacheErr.message)
            }
        }

        // ── return fresh results ──────────────────────────────────────
        res.status(200).json({
            message: "Job recommendations fetched successfully.",
            jobs,
            cached: false,
            queryKey
        })
    } catch (err) {
        // forward error to express error handler
        next(err)
    }
}

// retrieve all past recommended jobs for user
async function getPastRecommendationsController(req, res, next) {
    try {
        const userId = req.user?.id || req.user?._id;

        // Query cached entries strictly belonging to the authenticated user (array or legacy field)
        let entries = [];
        if (userId) {
            entries = await CachedJobs.find({
                $or: [
                    { users: userId },
                    { user: userId }
                ]
            }).sort({ createdAt: -1 }).limit(30);
        }

        const seen = new Set();
        const pastJobs = [];

        for (const entry of entries) {
            if (Array.isArray(entry.jobs)) {
                for (const job of entry.jobs) {
                    if (!job || !job.title || job.title === "N/A") continue;
                    const key = (job.url && job.url !== "#") ? job.url : `${job.title}::${job.company}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        pastJobs.push({
                            title: job.title,
                            company: job.company,
                            location: job.location,
                            url: job.url,
                            description: job.description,
                            createdAt: entry.createdAt,
                            keywords: entry.keywords
                        });
                    }
                }
            }
        }

        res.status(200).json({
            success: true,
            count: pastJobs.length,
            jobs: pastJobs
        });
    } catch (err) {
        next(err);
    }
}

// export controller handlers
module.exports = { recommendJobsController, getPastRecommendationsController }
