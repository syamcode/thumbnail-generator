import ffmpeg from "fluent-ffmpeg"
import fs from "fs"
import path from "path"
import { extractFrames } from "./services/videoProcessor"
import {
  calculateVisualAppealScores,
  selectKeyFrames,
} from "./services/scoringService"

// Step 4: Select top key frames

// Step 5: Generate a GIF from selected frames
function generateGifFromFrames(
  inputFrames: string[],
  gifPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpegCommand = ffmpeg()

    console.log("Selected frames:", inputFrames)

    // Add each frame as input
    inputFrames.forEach((frame) => ffmpegCommand.input(frame))

    ffmpegCommand
      .inputOptions("-framerate 2") // Adjust the framerate if necessary
      .output(gifPath)
      .outputOptions(
        "-vf",
        "fps=2,scale=320:-1:flags=lanczos", // Ensure scaling and smoothing
        "-pix_fmt",
        "rgb24", // Force the pixel format to RGB24 for GIF encoding
        "-t",
        "5" // Force a longer duration for each frame (adjust this as needed)
      )
      .on("stderr", (stderr) => console.log("FFmpeg stderr:", stderr)) // Capture FFmpeg stderr output
      //   .on("stdout", (stdout) => console.log("FFmpeg stdout:", stdout)) // Capture FFmpeg stdout output
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .run()
  })
}

// Main function
async function generateGif(
  videoPath: string,
  outputDir: string,
  gifPath: string
): Promise<void> {
  try {
    console.log("Detecting scene changes...")
    const sceneFrames = await extractFrames(videoPath, outputDir)

    console.log("Calculating visual appeal scores...")
    const appealScores = calculateVisualAppealScores(sceneFrames)

    console.log("Selecting key frames...")
    const keyFrames = selectKeyFrames(appealScores)

    // Generate GIF from selected frames
    console.log("Generating GIF...")
    await generateGifFromFrames(
      keyFrames.map((score) => score.file),
      gifPath
    )
    console.log("GIF generated at:", gifPath)
  } catch (err) {
    console.error("Error:", err)
    throw err
  }
}

// Example usage
;(async () => {
  const videoPath = "input.mp4"
  const outputDir = "frames"
  const gifPath = "output.gif"
  fs.mkdirSync(outputDir, { recursive: true })

  try {
    await generateGif(videoPath, outputDir, gifPath)
    console.log("GIF generation completed!")
  } catch (err) {
    console.error("Failed to generate GIF:", err)
  }
})()
