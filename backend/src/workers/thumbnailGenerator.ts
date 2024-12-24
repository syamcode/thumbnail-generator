import fs from "fs"
import { extractFrames } from "@/services/videoProcessor"
import {
  calculateVisualAppealScores,
  selectKeyFrames,
} from "@/services/frameScoring"
import { generateGifFromFrames } from "@/services/thumbnailGenerator"
import { downloadVideo } from "@/services/videoDownloader"

export async function generateThumbnail(
  videoURL: string,
  tempDir: string,
  outputPath: string
): Promise<void> {
  try {
    const videoPath = `${tempDir}/video.mp4`
    const frameDir = `${tempDir}/frames`

    console.log("Downloading the video...")
    const video = await downloadVideo(videoURL, videoPath)

    if (!video.success) {
      throw new Error("Fail to download video")
    }

    console.log("Detecting scene changes...")
    const sceneFrames = await extractFrames(videoPath, frameDir)

    console.log("Calculating visual appeal scores...")
    const appealScores = await calculateVisualAppealScores(sceneFrames)

    console.log("Selecting key frames...")
    const keyFrames = selectKeyFrames(appealScores)

    // Generate GIF from selected frames
    console.log("Generating GIF...")
    await generateGifFromFrames(
      keyFrames.map((score) => score.file),
      outputPath
    )
    console.log("GIF generated at:", outputPath)
  } catch (err) {
    console.error("Error:", err)
    throw err
  }
}
