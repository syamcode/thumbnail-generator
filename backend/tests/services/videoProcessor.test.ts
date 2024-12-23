import { extractFrames } from "@/services/videoProcessor"
import fs from "fs"
import path from "path"

describe("Video Frame Extractor", () => {
  const FIXTURES_DIR = "tests/fixtures"
  const OUTPUT_DIR = path.join(FIXTURES_DIR, "frames")
  const TEST_TIMEOUT = 10000

  // Test video paths
  const VIDEOS = {
    standard: path.join(FIXTURES_DIR, "video.mp4"),
    shortVideo: path.join(FIXTURES_DIR, "one_second.mp4"),
    nonExistent: path.join(FIXTURES_DIR, "nonexistent.mp4"),
    invalidFile: path.join(FIXTURES_DIR, "not_a_video.txt"),
  }

  beforeEach(async () => {
    // Ensure the output directory exists and is empty
    await fs.promises
      .rm(OUTPUT_DIR, { recursive: true, force: true })
      .catch(() => {})
    await fs.promises.mkdir(OUTPUT_DIR, { recursive: true })
  })

  afterEach(async () => {
    // Clean up the output directory
    await fs.promises
      .rm(OUTPUT_DIR, { recursive: true, force: true })
      .catch(() => {})
  })

  describe("Frame Extraction", () => {
    it("should extract frames at default rate for standard video", async () => {
      const frames = await extractFrames(VIDEOS.standard, OUTPUT_DIR)
      expect(frames.length).toBe(15)
      expect(frames.every((frame) => frame.startsWith(OUTPUT_DIR))).toBe(true)
    })

    it("should maintain minimum frame count for short videos", async () => {
      const frames = await extractFrames(VIDEOS.shortVideo, OUTPUT_DIR)
      expect(frames.length).toBe(5)
    })
  })

  describe("Error Handling", () => {
    it("should throw error for non-existent video file", async () => {
      await expect(
        extractFrames(VIDEOS.nonExistent, OUTPUT_DIR)
      ).rejects.toThrow("Input video file does not exist")
    })

    it("should throw error for invalid video file", async () => {
      await expect(
        extractFrames(VIDEOS.invalidFile, OUTPUT_DIR)
      ).rejects.toThrow("Input file is not a valid video")
    })

    it("should throw error when no paths are provided", async () => {
      await expect(extractFrames("", OUTPUT_DIR)).rejects.toThrow(
        "Video path and output directory are required"
      )
    })
  })

  describe("Output Directory Management", () => {
    it(
      "should clean directory before processing new video",
      async () => {
        // First extraction
        await extractFrames(VIDEOS.standard, OUTPUT_DIR)

        // Second extraction
        const frames = await extractFrames(VIDEOS.shortVideo, OUTPUT_DIR)
        const finalFiles = fs.readdirSync(OUTPUT_DIR)

        expect(finalFiles.length).toBe(5)
      },
      TEST_TIMEOUT
    )

    it("should create output directory if it does not exist", async () => {
      const newOutputDir = path.join(OUTPUT_DIR, "nested")
      const frames = await extractFrames(VIDEOS.shortVideo, newOutputDir)

      expect(fs.existsSync(newOutputDir)).toBe(true)
      expect(frames.length).toBe(5)
    })
  })
})
