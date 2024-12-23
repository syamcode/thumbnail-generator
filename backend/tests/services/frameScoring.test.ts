import {
  calculateVisualAppealScores,
  selectKeyFrames,
} from "@/services/frameScoring"
import path from "path"

interface FrameScore {
  file: string
  score: number
}

describe("Frame Analysis", () => {
  const FIXTURES_DIR = "tests/fixtures"
  const TEST_FRAMES_DIR = path.join(FIXTURES_DIR, "test_frames")
  const TEST_TIMEOUT = 50000

  const TEST_FRAMES = [
    "output_0001.jpg",
    "output_0002.jpg",
    "output_0003.jpg",
    "output_0004.jpg",
    "output_0005.jpg",
    "output_0006.jpg",
    "output_0007.jpg",
  ].map((frame) => path.join(TEST_FRAMES_DIR, frame))

  describe("Visual Appeal Calculation", () => {
    it(
      "should calculate valid scores for all input frames",
      async () => {
        const frameScores = await calculateVisualAppealScores(TEST_FRAMES)

        expect(frameScores).toHaveLength(TEST_FRAMES.length)
        frameScores.forEach((frame) => {
          expect(frame.score).toBeGreaterThanOrEqual(0)
          expect(frame.score).toBeLessThanOrEqual(1)
        })
      },
      TEST_TIMEOUT
    )

    it(
      "should handle custom scoring weights",
      async () => {
        const customWeights = {
          brightness: 0.6,
          contrast: 0.3,
          saturation: 0.1,
        }
        const frameScores = await calculateVisualAppealScores(
          TEST_FRAMES,
          customWeights
        )

        expect(frameScores).toHaveLength(TEST_FRAMES.length)
        frameScores.forEach((frame) => {
          expect(frame.score).toBeGreaterThanOrEqual(0)
          expect(frame.score).toBeLessThanOrEqual(1)
        })
      },
      TEST_TIMEOUT
    )
  })

  describe("Key Frame Selection", () => {
    const generateTestFrames = (count: number): FrameScore[] => {
      return Array.from({ length: count }, (_, i) => ({
        file: `file_${String(i).padStart(3, "0")}.jpg`,
        score: Math.random(),
      }))
    }

    it("should select top N frames when input exceeds limit", () => {
      const frameScores = generateTestFrames(15)
      const topFrames = selectKeyFrames(frameScores, 10)

      expect(topFrames).toHaveLength(10)
      expect(isFramesSortedByFilename(topFrames)).toBe(true)
    })

    it("should handle input smaller than requested count", () => {
      const frameScores = generateTestFrames(5)
      const topFrames = selectKeyFrames(frameScores, 10)

      expect(topFrames).toHaveLength(5)
      expect(isFramesSortedByFilename(topFrames)).toBe(true)
    })

    it("should maintain correct ordering by score then filename", () => {
      const frameScores: FrameScore[] = [
        { file: "c.jpg", score: 0.5 },
        { file: "a.jpg", score: 0.9 },
        { file: "b.jpg", score: 0.7 },
        { file: "d.jpg", score: 0.3 },
      ]

      const topFrames = selectKeyFrames(frameScores, 3)

      expect(topFrames).toHaveLength(3)
      expect(isFramesSortedByFilename(topFrames)).toBe(true)
      expect(topFrames.map((f) => f.file)).toEqual(["a.jpg", "b.jpg", "c.jpg"])
    })
  })
})

/**
 * Check if frames are sorted by filename
 */
function isFramesSortedByFilename(frameScores: FrameScore[]): boolean {
  for (let i = 1; i < frameScores.length; i++) {
    if (frameScores[i - 1].file > frameScores[i].file) {
      return false
    }
  }
  return true
}
