import ffmpeg from "fluent-ffmpeg"
import { promises as fs } from "fs"
import path from "path"

// Types
interface GifOptions {
  fps?: number
  width?: number
  loop?: boolean
  quality?: string
  verbose?: boolean
}

const DEFAULT_OPTIONS: Required<GifOptions> = {
  fps: 2,
  width: 320,
  loop: true,
  quality: "lanczos",
  verbose: false,
}

/**
 * Generate a GIF from a sequence of image frames
 * @param inputFrames - Array of paths to input image frames
 * @param gifPath - Output path for the generated GIF
 * @param options - Configuration options for GIF generation
 */
export async function generateGifFromFrames(
  inputFrames: string[],
  gifPath: string,
  options: GifOptions = {}
): Promise<void> {
  const config = { ...DEFAULT_OPTIONS, ...options }

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

    const filterString = [
      `fps=${config.fps}`,
      `scale=${config.width}:-1:flags=${config.quality}`,
      "split[s0][s1]",
      "[s0]palettegen[p]",
      "[s1][p]paletteuse",
    ].join(",")

    ffmpegCommand
      .input("concat:" + inputFrames.join("|"))
      .inputOptions(["-f image2pipe", `-framerate ${config.fps}`])
      .output(gifPath)
      .outputOptions([
        "-vf",
        filterString,
        config.loop ? "-loop 0" : "-loop -1",
      ])

    if (config.verbose) {
      ffmpegCommand
        .on("start", (command) => console.log("FFmpeg command:", command))
        .on("stderr", (stderr) => console.log("FFmpeg stderr:", stderr))
    }

    ffmpegCommand
      .on("end", () => {
        if (config.verbose) {
          console.log("GIF generation completed:", gifPath)
        }
        resolve()
      })
      .on("error", (err) => {
        const errorMessage = `GIF generation failed: ${err.message}`
        if (config.verbose) {
          console.error(errorMessage)
        }
        reject(new Error(errorMessage))
      })

    try {
      ffmpegCommand.run()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error"
      reject(new Error(`Failed to start FFmpeg: ${errorMessage}`))
    }
  })
}
