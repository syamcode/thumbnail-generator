import ffmpeg from "fluent-ffmpeg"
import { promises as fs } from "fs"
import path from "path"

/**
 * Configuration options for GIF generation
 */
interface GifOptions {
  fps?: number // Frames per second in the output GIF
  width?: number // Width of the output GIF (height auto-calculated)
  loop?: boolean // Whether the GIF should loop infinitely
  quality?: string // Quality/scaling algorithm to use
  verbose?: boolean // Whether to log detailed processing information
}

/**
 * Default settings for GIF generation if not specified
 */
const DEFAULT_OPTIONS: Required<GifOptions> = {
  fps: 2, // 2 frames per second
  width: 320, // 320 pixels wide
  loop: true, // Infinite looping
  quality: "lanczos", // High-quality scaling algorithm
  verbose: false, // No detailed logging by default
}

/**
 * Creates a GIF from a series of image files
 *
 * @param inputFrames - Array of file paths to the input images
 * @param gifPath - Where to save the output GIF
 * @param options - Optional configuration settings
 *
 * The function:
 * 1. Verifies all input images exist
 * 2. Creates the output directory if needed
 * 3. Sets up FFmpeg with filters for:
 *    - Controlling frame rate
 *    - Resizing the output
 *    - Generating and using an optimal color palette
 * 4. Processes the images into a GIF
 *
 * Example usage:
 * ```typescript
 * await generateGifFromFrames(
 *   ['frame1.jpg', 'frame2.jpg'],
 *   'output.gif',
 *   { fps: 1, width: 640 }
 * )
 * ```
 */
export async function generateGifFromFrames(
  inputFrames: string[],
  gifPath: string,
  options: GifOptions = {}
): Promise<void> {
  // Merge provided options with defaults
  const config = { ...DEFAULT_OPTIONS, ...options }

  // Input validation
  if (!inputFrames.length) {
    throw new Error("No input frames provided")
  }

  // Step 1: Verify all input images exist
  await Promise.all(
    inputFrames.map(async (frame) => {
      try {
        await fs.access(frame)
      } catch (error) {
        throw new Error(`Input frame not found: ${frame}`)
      }
    })
  )

  // Step 2: Ensure output directory exists
  const outputDir = path.dirname(gifPath)
  await fs.mkdir(outputDir, { recursive: true })

  // Step 3: Set up FFmpeg processing
  return new Promise((resolve, reject) => {
    const ffmpegCommand = ffmpeg()

    // FFmpeg filter setup:
    // 1. Set frame rate
    // 2. Resize while maintaining aspect ratio
    // 3. Generate optimal color palette
    // 4. Apply palette to final GIF
    const filterString = [
      `fps=${config.fps}`, // Control frame rate
      `scale=${config.width}:-1:flags=${config.quality}`, // Resize with high quality
      "split[s0][s1]", // Create two copies of the stream
      "[s0]palettegen[p]", // Generate color palette
      "[s1][p]paletteuse", // Apply palette to frames
    ].join(",")

    // Configure FFmpeg command
    ffmpegCommand
      .input("concat:" + inputFrames.join("|")) // Join all input frames
      .inputOptions([
        "-f image2pipe", // Treat input as image sequence
        `-framerate ${config.fps}`, // Set input frame rate
      ])
      .output(gifPath)
      .outputOptions([
        "-vf",
        filterString, // Apply our filter chain
        config.loop ? "-loop 0" : "-loop -1", // Configure looping
      ])

    // Set up logging if verbose mode is enabled
    if (config.verbose) {
      ffmpegCommand
        .on("start", (command) => console.log("FFmpeg command:", command))
        .on("stderr", (stderr) => console.log("FFmpeg stderr:", stderr))
    }

    // Handle completion and errors
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

    // Start the FFmpeg process
    try {
      ffmpegCommand.run()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error"
      reject(new Error(`Failed to start FFmpeg: ${errorMessage}`))
    }
  })
}
