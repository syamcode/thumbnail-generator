import fs from "fs"
import { extractFrames } from "@/services/videoProcessor"
import {
  calculateVisualAppealScores,
  selectKeyFrames,
} from "@/services/frameScoring"
import { generateGifFromFrames } from "@/services/thumbnailGenerator"

export async function generateThumbnail(
  videoPath: string,
  outputDir: string,
  gifPath: string
): Promise<void> {
  try {
    console.log("Detecting scene changes...")
    const sceneFrames = await extractFrames(videoPath, outputDir)

    console.log("Calculating visual appeal scores...")
    const appealScores = await calculateVisualAppealScores(sceneFrames)

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
