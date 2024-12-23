import sharp from "sharp"
import fs from "fs"

interface FrameScore {
  file: string
  score: number
}

export async function calculateVisualAppealScores(
  sceneFrames: string[]
): Promise<FrameScore[]> {
  const scores: FrameScore[] = []

  for (const file of sceneFrames) {
    try {
      const { brightness, contrast, saturation } = await analyzeImage(file)

      // Example scoring formula: Weighted sum of brightness, contrast, and saturation
      const score = brightness * 0.4 + contrast * 0.4 + saturation * 0.2
      scores.push({ file, score })
    } catch (err) {
      console.error(`Failed to analyze image ${file}:`, err)
    }
  }

  return scores
}

// Helper function to analyze image properties
async function analyzeImage(
  filePath: string
): Promise<{ brightness: number; contrast: number; saturation: number }> {
  const image = sharp(filePath)
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true })

  const pixelCount = info.width * info.height * info.channels
  let brightness = 0
  let contrast = 0
  let saturation = 0

  for (let i = 0; i < pixelCount; i += info.channels) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    // Brightness: Average intensity of RGB
    const intensity = (r + g + b) / 3
    brightness += intensity

    // Contrast: Difference from mean intensity
    contrast += Math.abs(intensity - brightness / pixelCount)

    // Saturation: Distance from grayscale
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    saturation += max - min
  }

  return {
    brightness: brightness / (pixelCount / info.channels),
    contrast: contrast / (pixelCount / info.channels),
    saturation: saturation / (pixelCount / info.channels),
  }
}

export function selectKeyFrames(
  appealScores: FrameScore[],
  topN: number = 10
): FrameScore[] {
  return appealScores
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .sort((a, b) => a.file.localeCompare(b.file))
}
