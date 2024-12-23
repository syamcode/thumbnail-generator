import ffmpeg from "fluent-ffmpeg"
import fs from "fs"
import path from "path"
import { extractFrames } from "./services/videoProcessor"
import {
  calculateVisualAppealScores,
  selectKeyFrames,
} from "./services/frameScoring"
import { generateGifFromFrames } from "@/services/thumbnailGenerator"

// Step 4: Select top key frames

// Step 5: Generate a GIF from selected frames

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
