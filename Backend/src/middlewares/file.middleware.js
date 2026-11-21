// path module for extension check
const path = require("path")
// multer library for multipart form file uploads
const multer = require("multer")

// configure in-memory upload handler with strict PDF validation
const upload = multer({
    // keep uploaded file in memory buffer instead of writing to disk
    storage: multer.memoryStorage(),
    // restrict maximum file size to 3MB
    limits: {
        fileSize: 3 * 1024 * 1024 // 3MB cap
    },
    // strictly validate that only PDF files are accepted
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname || "").toLowerCase()
        const isPdfMime = file.mimetype === "application/pdf"
        const isPdfExt = ext === ".pdf"

        if (isPdfMime && isPdfExt) {
            cb(null, true)
        } else {
            const err = new Error("Invalid file type. Only PDF documents (.pdf) are allowed.")
            err.status = 400
            cb(err, false)
        }
    }
})

// export multer instance
module.exports = upload
