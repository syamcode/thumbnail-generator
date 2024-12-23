import ffmpeg from "fluent-ffmpeg"
import fs from "fs"
import path from "path"

export async function extractFrames(
  videoPath: string,
  outputDir: string
): Promise<string[]> {
  if (fs.existsSync(outputDir)) {
    fs.rmdirSync(outputDir, { recursive: true })
  }
  fs.mkdirSync(outputDir, { recursive: true })
  if (!fs.existsSync(videoPath)) {
    return Promise.reject(new Error("Input video file does not exist"))
  }
  const { isVideo, duration } = await getVideoInfo(videoPath)
  if (!isVideo) {
    return Promise.reject(new Error("Input video file does not exist"))
  }
  const fps = Math.max(1, 5 / (duration ?? 1))
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions([
        "-vf",
        `fps=${fps}`,
        "-qscale:v",
        "2", // Output quality (2 is the highest quality)
      ])
      .output(path.join(outputDir, "frame%04d.png"))
      .on("end", () => {
        const files = fs
          .readdirSync(outputDir)
          .filter((file) => file.startsWith("frame"))
        resolve(files.map((file) => path.join(outputDir, file)))
      })
      .on("error", (err) => {
        console.error("FFmpeg error:", err.message)
        reject(err)
      })
      .run()
  })
}

function getVideoInfo(
  filePath: string
): Promise<{ isVideo: boolean; duration: number | null }> {
  return new Promise((resolve, reject) => {
    ffmpeg(filePath).ffprobe((err, data) => {
      if (err) {
        console.error("Error probing file:", err.message)
        resolve({ isVideo: false, duration: null }) // File is not a valid video
      } else {
        const hasVideoStream = data.streams.some(
          (stream) => stream.codec_type === "video"
        )
        const duration = data.format?.duration || null // Duration in seconds if available
        resolve({ isVideo: hasVideoStream, duration })
      }
    })
  })
}
