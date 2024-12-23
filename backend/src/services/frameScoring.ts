import sharp from "sharp"

// Types
interface FrameScore {
  file: string
  score: number
}

interface ImageAnalysis {
  brightness: number
  contrast: number
  saturation: number
}

interface ScoreWeights {
  brightness: number
  contrast: number
  saturation: number
}

// Constants
const DEFAULT_WEIGHTS: ScoreWeights = {
  brightness: 0.4,
  contrast: 0.4,
  saturation: 0.2,
}

/**
 * Calculate visual appeal scores for a set of image frames
 */
export async function calculateVisualAppealScores(
  sceneFrames: string[],
  weights: ScoreWeights = DEFAULT_WEIGHTS
): Promise<FrameScore[]> {
  const scores: FrameScore[] = []

  for (const file of sceneFrames) {
    try {
      const analysis = await analyzeImage(file)
      const score = calculateScore(analysis, weights)
      scores.push({ file, score })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error"
      throw new Error(`Failed to analyze image ${file}: ${errorMessage}`)
    }
  }

  return scores
}

/**
 * Select top N frames based on their visual appeal scores
 */
export function selectKeyFrames(
  appealScores: FrameScore[],
  topN: number = 10
): FrameScore[] {
  return appealScores
    .sort((a, b) => b.score - a.score) // Sort by score descending
    .slice(0, topN) // Take top N
    .sort((a, b) => a.file.localeCompare(b.file)) // Sort by filename
}

/**
 * Analyze image properties using Sharp
 */
async function analyzeImage(filePath: string): Promise<ImageAnalysis> {
  const image = sharp(filePath)
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true })

  const pixelCount = info.width * info.height
  const channelCount = info.channels
  let totalBrightness = 0
  let totalContrast = 0
  let totalSaturation = 0

  for (let i = 0; i < pixelCount * channelCount; i += channelCount) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    const intensity = (r + g + b) / 3
    totalBrightness += intensity

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    totalSaturation += max - min
  }

  const avgBrightness = totalBrightness / pixelCount

  // Calculate contrast after knowing average brightness
  let totalContrastDiff = 0
  for (let i = 0; i < pixelCount * channelCount; i += channelCount) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const intensity = (r + g + b) / 3
    totalContrastDiff += Math.abs(intensity - avgBrightness)
  }

  return {
    brightness: avgBrightness / 255, // Normalize to 0-1
    contrast: totalContrastDiff / (pixelCount * 255), // Normalize to 0-1
    saturation: totalSaturation / (pixelCount * 255), // Normalize to 0-1
  }
}

/**
 * Calculate weighted score from image analysis
 */
function calculateScore(
  analysis: ImageAnalysis,
  weights: ScoreWeights
): number {
  return (
    analysis.brightness * weights.brightness +
    analysis.contrast * weights.contrast +
    analysis.saturation * weights.saturation
  )
}
