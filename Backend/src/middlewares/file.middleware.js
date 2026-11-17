// multer library for multipart form file uploads
const multer = require("multer")

// configure in-memory upload handler
const upload = multer({
    // keep uploaded file in memory buffer instead of writing to disk
    storage: multer.memoryStorage(),
    // restrict maximum file size to 3MB
    limits: {
        fileSize: 3 * 1024 * 1024 // 3MB cap
    }
})

// export multer instance
module.exports = upload
