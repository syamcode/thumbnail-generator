import express, { Request, Response, NextFunction } from "express"
import multer from "multer"
import Bull from "bull"
import { asyncHandler } from "./utils/asyncHandler"

const app = express()
const upload = multer({ dest: "uploads/" })

const thumbnailQueue = new Bull<{ videoPath: string }>("thumbnailQueue", {
  redis: { host: "127.0.0.1", port: 6379 },
})

app.post(
  "/upload",
  upload.single("video"),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: "No video file uploaded" })
      return
    }

    const videoPath = req.file.path
    const job = await thumbnailQueue.add({ videoPath })

    res.json({
      jobId: job.id,
      message: "Processing started. Check status at /status/:jobId",
    })
  })
)

app.get(
  "/status/:jobId",
  asyncHandler(async (req: Request, res: Response) => {
    const { jobId } = req.params
    const job = await thumbnailQueue.getJob(jobId)

    if (!job) {
      res.status(404).json({ error: "Job not found" })
      return
    }

    const state = await job.getState()
    const progress = job.progress()

    if (state === "completed") {
      res.json({ state, thumbnail: job.returnvalue })
    } else {
      res.json({ state, progress })
    }
  })
)

// Start the server
const PORT = 3000
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
)
