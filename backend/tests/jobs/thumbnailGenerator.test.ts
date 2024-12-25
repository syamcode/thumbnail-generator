import { thumbnailGenerationQueue } from "@/jobs/thumbnailGeneration"
import { promises as fs } from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

jest.setTimeout(30000)

interface TestPaths {
  tempDir: string
  gifPath: string
}

const VIDEO_URL =
  "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_5MB.mp4"
const TEMP_BASE_DIR = "temps"
const GIF_BASE_DIR = "assets/gif"
const JOB_ATTEMPTS = 3

describe("Thumbnail generation queue", () => {
  const createTestPaths = (jobId: string): TestPaths => ({
    tempDir: path.join(TEMP_BASE_DIR, jobId),
    gifPath: path.join(GIF_BASE_DIR, `${jobId}.gif`),
  })

  const ensureDirectories = async (paths: TestPaths): Promise<void> => {
    for (const dir of [paths.tempDir, GIF_BASE_DIR]) {
      await fs.mkdir(dir, { recursive: true })
    }
  }

  const cleanupDirectories = async (paths: TestPaths): Promise<void> => {
    try {
      await fs.rm(paths.tempDir, { recursive: true, force: true })
      await fs.rm(paths.gifPath, { force: true })
    } catch (error) {
      console.error("Cleanup error:", error)
    }
  }

  const createJob = async (jobId: string, paths: TestPaths) => {
    return await thumbnailGenerationQueue.add(
      {
        videoURL: VIDEO_URL,
        tempDir: paths.tempDir,
        gifPath: paths.gifPath,
      },
      {
        jobId,
        attempts: JOB_ATTEMPTS,
        removeOnComplete: false,
        removeOnFail: false,
      }
    )
  }

  const waitForJobCompletion = (expectedJobId: string) => {
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        thumbnailGenerationQueue.removeListener("completed", handleComplete)
        thumbnailGenerationQueue.removeListener("failed", handleFailed)
      }

      const handleComplete = (job: any, result: any) => {
        if (job.id === expectedJobId) {
          cleanup()
          resolve(result)
        }
      }

      const handleFailed = (job: any, error: Error) => {
        if (job.id === expectedJobId) {
          cleanup()
          reject(error)
        }
      }

      thumbnailGenerationQueue.on("completed", handleComplete)
      thumbnailGenerationQueue.on("failed", handleFailed)
    })
  }

  beforeEach(async () => {
    await thumbnailGenerationQueue.empty()
    await thumbnailGenerationQueue.clean(0, "completed")
    await thumbnailGenerationQueue.clean(0, "failed")
  })

  afterAll(async () => {
    await thumbnailGenerationQueue.empty()
    await thumbnailGenerationQueue.clean(0, "completed")
    await thumbnailGenerationQueue.clean(0, "failed")
    await thumbnailGenerationQueue.close()
  })

  it("should process a job successfully", async () => {
    const jobId = uuidv4()
    const paths = createTestPaths(jobId)

    try {
      await ensureDirectories(paths)
      const job = await createJob(jobId, paths)
      const expectedGifURL = `http://localhost:3000/gifs/${job.id}.gif`

      const result = await waitForJobCompletion(jobId)
      expect(result).toEqual({ success: true, gifUrl: expectedGifURL })

      await new Promise((resolve) => setTimeout(resolve, 100))

      const processedJob = await thumbnailGenerationQueue.getJob(jobId)
      const state = await processedJob?.getState()
      expect(state).toBe("completed")
    } finally {
      await cleanupDirectories(paths)
    }
  })
})
