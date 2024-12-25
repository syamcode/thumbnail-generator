import sharp from "sharp"

/**
 * Represents a frame and its calculated visual appeal score
 */
interface FrameScore {
  file: string // Path to the image file
  score: number // Calculated visual appeal score (0-1)
}

/**
 * Measurements of various image qualities
 */
interface ImageAnalysis {
  brightness: number // Average brightness (0-1)
  contrast: number // Amount of difference between light and dark areas (0-1)
  saturation: number // Color intensity/vividness (0-1)
}

/**
 * Importance factors for each image quality in final score calculation
 */
interface ScoreWeights {
  brightness: number // How important brightness is (0-1)
  contrast: number // How important contrast is (0-1)
  saturation: number // How important color saturation is (0-1)
}

/**
 * Default importance weights for scoring
 * - Brightness (40%): How well-lit the image is
 * - Contrast (40%): How well-defined the elements are
 * - Saturation (20%): How vivid the colors are
 */
const DEFAULT_WEIGHTS: ScoreWeights = {
  brightness: 0.4,
  contrast: 0.4,
  saturation: 0.2,
}

/**
 * Analyzes a set of images and scores them based on visual appeal
 *
 * @param sceneFrames - Array of paths to image files
 * @param weights - Optional custom weights for scoring
 * @returns Array of frames with their calculated scores
 *
 * Example usage:
 * ```typescript
 * const scores = await calculateVisualAppealScores([
 *   'frame1.jpg',
 *   'frame2.jpg'
 * ]);
 * ```
 */
export async function calculateVisualAppealScores(
  sceneFrames: string[],
  weights: ScoreWeights = DEFAULT_WEIGHTS
): Promise<FrameScore[]> {
  const scores: FrameScore[] = []

  for (const file of sceneFrames) {
    try {
      // Analyze image qualities and calculate final score
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
 * Selects the best frames based on their scores
 *
 * @param appealScores - Array of scored frames
 * @param topN - Number of frames to select (default: 10)
 * @returns Selected frames, sorted by filename
 */
export function selectKeyFrames(
  appealScores: FrameScore[],
  topN: number = 10
): FrameScore[] {
  return appealScores
    .sort((a, b) => b.score - a.score) // Sort by highest score first
    .slice(0, topN) // Take only the top N frames
    .sort((a, b) => a.file.localeCompare(b.file)) // Sort by filename for consistency
}

/**
 * Analyzes image properties by examining individual pixels
 *
 * Process:
 * 1. Reads raw pixel data using Sharp
 * 2. For each pixel:
 *    - Calculates brightness from RGB values
 *    - Calculates saturation from RGB range
 * 3. Makes a second pass to calculate contrast using average brightness
 *
 * @param filePath - Path to image file
 * @returns Analysis of image qualities
 */
async function analyzeImage(filePath: string): Promise<ImageAnalysis> {
  // Load image and get raw pixel data
  const image = sharp(filePath)
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true })

  const pixelCount = info.width * info.height
  const channelCount = info.channels
  let totalBrightness = 0
  let totalSaturation = 0

  // First pass: Calculate brightness and saturation
  for (let i = 0; i < pixelCount * channelCount; i += channelCount) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    // Brightness is average of RGB values
    const intensity = (r + g + b) / 3
    totalBrightness += intensity

    // Saturation is difference between highest and lowest RGB values
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    totalSaturation += max - min
  }

  const avgBrightness = totalBrightness / pixelCount

  // Second pass: Calculate contrast using average brightness
  let totalContrastDiff = 0
  for (let i = 0; i < pixelCount * channelCount; i += channelCount) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const intensity = (r + g + b) / 3
    // Contrast is how different each pixel is from average brightness
    totalContrastDiff += Math.abs(intensity - avgBrightness)
  }

  // Normalize all values to 0-1 range
  return {
    brightness: avgBrightness / 255,
    contrast: totalContrastDiff / (pixelCount * 255),
    saturation: totalSaturation / (pixelCount * 255),
  }
}

/**
 * Calculates final score by combining analysis values according to weights
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
