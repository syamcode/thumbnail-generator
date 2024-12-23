import { generateGifFromFrames } from "@/services/thumbnailGenerator"
import { promises as fs } from "fs"
import path from "path"

describe("GIF Generator", () => {
  const FIXTURES_DIR = "tests/fixtures"
  const TEST_FRAMES_DIR = path.join(FIXTURES_DIR, "test_gif")
  const OUTPUT_DIR = FIXTURES_DIR
  const OUTPUT_PATH = path.join(OUTPUT_DIR, "output.gif")

  const TEST_FRAMES = [
    "output_0001.jpg",
    "output_0002.jpg",
    "output_0003.jpg",
    "output_0004.jpg",
    "output_0005.jpg",
    "output_0006.jpg",
    "output_0007.jpg",
  ].map((frame) => path.join(TEST_FRAMES_DIR, frame))

  // Cleanup helper function
  async function cleanupOutputFiles() {
    try {
      await fs.unlink(OUTPUT_PATH)
    } catch (error) {
      // Ignore error if file doesn't exist
    }
  }

  beforeEach(async () => {
    await cleanupOutputFiles()
  })

  afterEach(async () => {
    await cleanupOutputFiles()
  })

  describe("Successful GIF Generation", () => {
    it("should generate a GIF from valid input frames", async () => {
      await generateGifFromFrames(TEST_FRAMES, OUTPUT_PATH)
      const fileExists = await fs
        .access(OUTPUT_PATH)
        .then(() => true)
        .catch(() => false)

      expect(fileExists).toBe(true)
    })

    it("should generate a GIF with custom options", async () => {
      await generateGifFromFrames(TEST_FRAMES, OUTPUT_PATH, {
        fps: 5,
        width: 640,
      })

      const fileExists = await fs
        .access(OUTPUT_PATH)
        .then(() => true)
        .catch(() => false)

      expect(fileExists).toBe(true)
    })
  })

  describe("Error Handling", () => {
    it("should throw error when no input frames are provided", async () => {
      await expect(generateGifFromFrames([], OUTPUT_PATH)).rejects.toThrow(
        "No input frames provided"
      )
    })

    it("should throw error when input frame does not exist", async () => {
      const nonExistentFrame = path.join(TEST_FRAMES_DIR, "nonexistent.jpg")

      await expect(
        generateGifFromFrames([nonExistentFrame], OUTPUT_PATH)
      ).rejects.toThrow(`Input frame not found: ${nonExistentFrame}`)
    })
  })

  describe("Output Directory Management", () => {
    it("should create output directory if it does not exist", async () => {
      const nestedOutputDir = path.join(OUTPUT_DIR, "nested")
      const nestedOutputPath = path.join(nestedOutputDir, "output.gif")

      await generateGifFromFrames(TEST_FRAMES, nestedOutputPath)

      const dirExists = await fs
        .access(nestedOutputDir)
        .then(() => true)
        .catch(() => false)

      expect(dirExists).toBe(true)

      // Cleanup nested directory
      await fs.rm(nestedOutputDir, { recursive: true, force: true })
    })
  })
})
