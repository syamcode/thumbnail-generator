import { downloadVideo } from "@/services/videoDownloader"
import { promises as fs } from "fs"
import path from "path"

jest.setTimeout(30000)

describe("Video Downloader", () => {
  const FIXTURES_DIR = "tests/fixtures"
  const TEST_VIDEO_PATH = path.join(FIXTURES_DIR, "downloadedVideo.mp4")

  const TEST_VIDEOS = {
    valid:
      "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_5MB.mp4",
    notVideo: "https://test-videos.co.uk/user/pages/images/big_buck_bunny.jpg",
    invalid: "invalidUrl",
  }

  // Cleanup helper
  async function cleanupDownloadedFiles() {
    try {
      await fs.unlink(TEST_VIDEO_PATH)
    } catch {
      // Ignore if file doesn't exist
    }
  }

  beforeEach(async () => {
    await cleanupDownloadedFiles()
  })

  afterEach(async () => {
    await cleanupDownloadedFiles()
  })

  describe("Successful Downloads", () => {
    it("should download video from valid URL", async () => {
      const result = await downloadVideo(TEST_VIDEOS.valid, TEST_VIDEO_PATH)

      const fileExists = await fs
        .access(TEST_VIDEO_PATH)
        .then(() => true)
        .catch(() => false)

      expect(result.success).toBe(true)
      expect(fileExists).toBe(true)
      expect(result.filePath).toBe(TEST_VIDEO_PATH)
    })

    it("should download video with custom configuration", async () => {
      const result = await downloadVideo(
        TEST_VIDEOS.valid,
        TEST_VIDEO_PATH,
        { maxFileSize: 200 * 1024 * 1024 } // 200MB
      )

      expect(result.success).toBe(true)
    })
  })

  describe("Error Handling", () => {
    it("should fail with invalid URL format", async () => {
      const result = await downloadVideo(TEST_VIDEOS.invalid, TEST_VIDEO_PATH)

      const fileExists = await fs
        .access(TEST_VIDEO_PATH)
        .then(() => true)
        .catch(() => false)

      expect(result.success).toBe(false)
      expect(result.message).toContain("Invalid URL format")
      expect(fileExists).toBe(false)
    })

    it("should fail when URL points to non-video content", async () => {
      const result = await downloadVideo(TEST_VIDEOS.notVideo, TEST_VIDEO_PATH)

      const fileExists = await fs
        .access(TEST_VIDEO_PATH)
        .then(() => true)
        .catch(() => false)

      expect(result.success).toBe(false)
      expect(result.message).toContain("Invalid file type")
      expect(fileExists).toBe(false)
    })

    it("should fail when file size exceeds limit", async () => {
      const result = await downloadVideo(
        TEST_VIDEOS.valid,
        TEST_VIDEO_PATH,
        { maxFileSize: 1024 } // 1KB limit
      )

      expect(result.success).toBe(false)
      expect(result.message).toContain("exceeds maximum allowed size")
    })
  })
})
