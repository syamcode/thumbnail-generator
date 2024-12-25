import fs from "fs"
import { extractFrames } from "@/services/videoProcessor"
import {
  calculateVisualAppealScores,
  selectKeyFrames,
} from "@/services/frameScoring"
import { generateGifFromFrames } from "@/services/thumbnailGenerator"
import { downloadVideo } from "@/services/videoDownloader"

/**
 * Generates an animated thumbnail (GIF) from a video URL through a multi-step process:
 * 1. Downloads the source video
 * 2. Extracts frames from scene changes
 * 3. Analyzes frames for visual appeal
 * 4. Selects the best frames
 * 5. Combines them into a GIF
 *
 * @param videoURL - URL of the source video to process
 * @param tempDir - Directory for storing temporary files during processing
 * @param outputPath - Destination path for the generated GIF
 *
 * @throws Error if video download fails
 * @throws Error if any processing step fails (from underlying services)
 *
 * Directory Structure:
 * - tempDir/
 *   ├── video.mp4 - Downloaded source video
 *   └── frames/   - Extracted video frames
 */
export async function generateThumbnail(
  videoURL: string,
  tempDir: string,
  outputPath: string
): Promise<void> {
  try {
    // Define working paths for processing
    const videoPath = `${tempDir}/video.mp4`
    const frameDir = `${tempDir}/frames`

    // Step 1: Download and verify video
    console.log("Downloading the video...")
    const video = await downloadVideo(videoURL, videoPath)
    if (!video.success) {
      throw new Error("Fail to download video")
    }

    // Step 2: Extract frames from scene changes
    console.log("Detecting scene changes...")
    const sceneFrames = await extractFrames(videoPath, frameDir)

    // Step 3: Analyze visual quality of extracted frames
    console.log("Calculating visual appeal scores...")
    const appealScores = await calculateVisualAppealScores(sceneFrames)

    // Step 4: Select the best frames based on scores
    console.log("Selecting key frames...")
    const keyFrames = selectKeyFrames(appealScores)

    // Step 5: Combine selected frames into final GIF
    console.log("Generating GIF...")
    await generateGifFromFrames(
      keyFrames.map((score) => score.file),
      outputPath
    )
  } catch (err) {
    console.error("Error:", err)
    throw err
  }
}
