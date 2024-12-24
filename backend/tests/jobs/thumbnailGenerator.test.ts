import { thumbnailGenerationQueue } from "@/jobs/thumbnailGeneration"
import { promises as fs } from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

describe("Thumbnail generation queue", () => {
  const TEST_CONFIG = {
    VIDEO_URL:
      "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_5MB.mp4",
    TIMEOUT: 30000,
    TEMP_BASE_DIR: "temps",
    GIF_BASE_DIR: "assets/gif",
    JOB_ATTEMPTS: 3,
  }

  // Helper to create and manage test-specific paths
  const createTestPaths = (jobId: string) => ({
    tempDir: path.join(TEST_CONFIG.TEMP_BASE_DIR, jobId),
    gifPath: path.join(TEST_CONFIG.GIF_BASE_DIR, `${jobId}.gif`),
  })

  // Helper to ensure directories exist
  interface TestPaths {
    tempDir: string
    gifPath: string
  }

  const ensureDirectories = async (paths: TestPaths): Promise<void> => {
    for (const dir of [paths.tempDir, TEST_CONFIG.GIF_BASE_DIR]) {
      await fs.mkdir(dir, { recursive: true })
    }
  }

  // Helper to clean up directories
  const cleanupDirectories = async (paths: TestPaths) => {
    try {
      await fs.rm(paths.tempDir, { recursive: true, force: true })
      await fs.rm(paths.gifPath, { force: true })
    } catch (error) {
      console.error("Cleanup error:", error)
    }
  }

  // Helper to create a job
  const createJob = async (jobId: string, paths: TestPaths) => {
    return await thumbnailGenerationQueue.add(
      {
        videoURL: TEST_CONFIG.VIDEO_URL,
        tempDir: paths.tempDir,
        gifPath: paths.gifPath,
      },
      {
        jobId,
        attempts: TEST_CONFIG.JOB_ATTEMPTS,
        removeOnComplete: false,
        removeOnFail: false,
      }
    )
  }

  // Helper to wait for job completion
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

  it(
    "should process a job successfully",
    async () => {
      const jobId = uuidv4()
      const paths = createTestPaths(jobId)

      try {
        await ensureDirectories(paths)
        const job = await createJob(jobId, paths)

        const result = await waitForJobCompletion(jobId)
        expect(result).toEqual({ success: true, gifPath: paths.gifPath })

        // Add a small delay to ensure job state is updated
        await new Promise((resolve) => setTimeout(resolve, 100))

        const processedJob = await thumbnailGenerationQueue.getJob(jobId)
        const state = await processedJob?.getState()
        expect(state).toBe("completed")
      } finally {
        await cleanupDirectories(paths)
      }
    },
    TEST_CONFIG.TIMEOUT
  )
})
