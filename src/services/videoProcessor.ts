import ffmpeg from "fluent-ffmpeg"
import fs from "fs"
import path from "path"

// Types
interface VideoInfo {
  isVideo: boolean
  duration: number | null
}

interface FrameExtractionOptions {
  minFPS: number
  quality?: number
  filePattern?: string
}

// Constants
const DEFAULT_OPTIONS: FrameExtractionOptions = {
  minFPS: 5,
  quality: 2, // Highest quality
}

/**
 * Extract frames from a video file at specified intervals
 * @param videoPath - Path to the input video file
 * @param outputDir - Directory to save extracted frames
 * @param options - Optional configuration for frame extraction
 * @returns Promise resolving to array of extracted frame file paths
 */
export async function extractFrames(
  videoPath: string,
  outputDir: string,
  options: FrameExtractionOptions = DEFAULT_OPTIONS
): Promise<string[]> {
  // Validate inputs
  if (!videoPath || !outputDir) {
    throw new Error("Video path and output directory are required")
  }

  // Ensure video file exists
  if (!fs.existsSync(videoPath)) {
    throw new Error(`Input video file does not exist: ${videoPath}`)
  }

  // Clean and create output directory
  await prepareOutputDirectory(outputDir)

  // Get video information
  const videoInfo = await getVideoInfo(videoPath)
  if (!videoInfo.isVideo) {
    throw new Error("Input file is not a valid video")
  }

  // Calculate appropriate FPS based on video duration
  const fps = calculateFps(videoInfo.duration, options.minFPS)

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions([
        "-vf",
        `fps=${fps}`,
        "-qscale:v",
        String(options.quality),
      ])
      .output(path.join(outputDir, "frame%04d.png"))
      .on("end", () => {
        const framePaths = getExtractedFramePaths(outputDir)
        resolve(framePaths)
      })
      .on("error", (err: Error) => {
        reject(new Error(`Frame extraction failed: ${err.message}`))
      })
      .run()
  })
}

/**
 * Get information about a video file
 * @param filePath - Path to the video file
 * @returns Promise resolving to video information
 */
async function getVideoInfo(filePath: string): Promise<VideoInfo> {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(filePath, (err, data) => {
      if (err) {
        console.error("Error probing file:", err.message)
        return resolve({ isVideo: false, duration: null })
      }

      const hasVideoStream = data.streams.some(
        (stream) => stream.codec_type === "video"
      )
      const duration = data.format?.duration || null

      resolve({ isVideo: hasVideoStream, duration })
    })
  })
}

/**
 * Prepare output directory by cleaning existing contents and creating new directory
 * @param outputDir - Directory path to prepare
 */
async function prepareOutputDirectory(outputDir: string): Promise<void> {
  if (fs.existsSync(outputDir)) {
    await fs.promises.rm(outputDir, { recursive: true, force: true })
  }
  await fs.promises.mkdir(outputDir, { recursive: true })
}

/**
 * Calculate appropriate FPS based on video duration
 * @param duration - Video duration in seconds
 * @param targetFps - Desired frames per second
 * @returns Calculated FPS value
 */
function calculateFps(
  duration: number | null,
  targetFps = DEFAULT_OPTIONS.minFPS
): number {
  if (!duration || duration <= 0) {
    return targetFps
  }
  return Math.max(1, targetFps / duration)
}

/**
 * Get paths of all extracted frames in the output directory
 * @param outputDir - Directory containing extracted frames
 * @returns Array of frame file paths
 */
function getExtractedFramePaths(outputDir: string): string[] {
  return fs
    .readdirSync(outputDir)
    .filter((file) => file.startsWith("frame"))
    .map((file) => path.join(outputDir, file))
}
