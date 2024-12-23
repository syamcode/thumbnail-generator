import ffmpeg from "fluent-ffmpeg"
import { promises as fs } from "fs"
import path from "path"

export async function generateGifFromFrames(
  inputFrames: string[],
  gifPath: string
): Promise<void> {
  if (!inputFrames.length) {
    throw new Error("No input frames provided")
  }

  // Verify all input frames exist before starting
  await Promise.all(
    inputFrames.map(async (frame) => {
      try {
        await fs.access(frame)
      } catch (error) {
        throw new Error(`Input frame not found: ${frame}`)
      }
    })
  )

  // Ensure output directory exists
  const outputDir = path.dirname(gifPath)
  await fs.mkdir(outputDir, { recursive: true })

  return new Promise((resolve, reject) => {
    const ffmpegCommand = ffmpeg()

    // Use concat filter instead of multiple inputs
    ffmpegCommand
      .input("concat:" + inputFrames.join("|"))
      .inputOptions(["-f image2pipe", "-framerate 2"])
      .output(gifPath)
      .outputOptions([
        "-vf",
        "fps=2,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
        "-loop 0", // Make the GIF loop indefinitely
      ])
      .on("start", (command) => {
        console.log("FFmpeg command:", command)
      })
      .on("stderr", (stderr) => {
        console.log("FFmpeg stderr:", stderr)
      })
      .on("end", () => {
        console.log("GIF generation completed:", gifPath)
        resolve()
      })
      .on("error", (err) => {
        console.error("FFmpeg error:", err)
        reject(err)
      })

    try {
      ffmpegCommand.run()
    } catch (error) {
      reject(error)
    }
  })
}
