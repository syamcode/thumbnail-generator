import { generateThumbnail } from "@/workers/thumbnailGenerator"
import { promises as fs } from "fs"
import path from "path"

describe("Thumbnail generator worker", () => {
  const TEST_CONFIG = {
    FIXTURES_DIR: "tests/fixtures",
    TEST_TIMEOUT: 30000,
    VIDEO_URL:
      "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_5MB.mp4",
  }

  const PATHS = {
    TEMP_DIR: path.join(TEST_CONFIG.FIXTURES_DIR, "temps"),
    OUTPUT_PATH: path.join(TEST_CONFIG.FIXTURES_DIR, "result.gif"),
  }

  // Helper to check if a path exists
  const pathExists = async (path: string) => {
    try {
      await fs.access(path)
      return true
    } catch {
      return false
    }
  }

  // Enhanced cleanup helper with existence check and logging
  const cleanupGeneratedFiles = async () => {
    for (const [key, filePath] of Object.entries(PATHS)) {
      if (await pathExists(filePath)) {
        try {
          await fs.rm(filePath, { recursive: true, force: true })
          console.log(`Successfully cleaned up ${key} at: ${filePath}`)
        } catch (error) {
          console.error(`Error cleaning up ${key} at ${filePath}:`, error)
        }
      } else {
        console.log(`${key} doesn't exist at: ${filePath}`)
      }
    }
  }

  // Ensure the fixtures directory exists
  const ensureFixturesDir = async () => {
    try {
      await fs.mkdir(TEST_CONFIG.FIXTURES_DIR, { recursive: true })
    } catch (error) {
      console.error("Error creating fixtures directory:", error)
      throw error
    }
  }

  beforeAll(async () => {
    await ensureFixturesDir()
  })

  beforeEach(async () => {
    console.log("Starting cleanup before test...")
    await cleanupGeneratedFiles()
  })

  afterEach(async () => {
    console.log("Starting cleanup after test...")
    await cleanupGeneratedFiles()
  })

  it(
    "should successfully generate gif thumbnail",
    async () => {
      await generateThumbnail(
        TEST_CONFIG.VIDEO_URL,
        PATHS.TEMP_DIR,
        PATHS.OUTPUT_PATH
      )

      const outputExists = await pathExists(PATHS.OUTPUT_PATH)
      expect(outputExists).toBe(true)
    },
    TEST_CONFIG.TEST_TIMEOUT
  )
})
