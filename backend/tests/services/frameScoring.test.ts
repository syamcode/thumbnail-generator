import {
  calculateVisualAppealScores,
  selectKeyFrames,
} from "@/services/frameScoring"
import path from "path"

describe("Successful calculate visual appeal", () => {
  const FIXTURES_DIR = "tests/fixtures"
  const TEST_FRAMES_DIR = path.join(FIXTURES_DIR, "test_frames")

  const TEST_FRAMES = [
    "output_0001.jpg",
    "output_0002.jpg",
    "output_0003.jpg",
    "output_0004.jpg",
    "output_0005.jpg",
    "output_0006.jpg",
    "output_0007.jpg",
  ].map((frame) => path.join(TEST_FRAMES_DIR, frame))

  it("should return visual appeal score for each given frame", async () => {
    const frameScores = await calculateVisualAppealScores(TEST_FRAMES)
    frameScores.forEach((frame) => {
      expect(frame.score).toBeGreaterThanOrEqual(0)
    })
  }, 50000)
})

describe("Select top frames", () => {
  it("should take top 10 frames", async () => {
    const frameScores = []
    for (let i = 0; i < 15; i++) {
      const randomFile = `file_${Math.floor(Math.random() * 1000)}.jpg` // Random file name
      const randomScore = Math.random()
      frameScores.push({
        file: randomFile,
        score: parseFloat(randomScore.toFixed(2)), // Limit score to 2 decimal places
      })
    }
    const topFrames = selectKeyFrames(frameScores, 10)
    expect(topFrames.length).toBe(10)
  }, 50000)

  it("should return less than 10 if the frames less than 10", () => {
    const frameScores = []
    for (let i = 0; i < 5; i++) {
      const randomFile = `file_${Math.floor(Math.random() * 1000)}.jpg` // Random file name
      const randomScore = Math.random()
      frameScores.push({
        file: randomFile,
        score: parseFloat(randomScore.toFixed(2)), // Limit score to 2 decimal places
      })
    }
    const topFrames = selectKeyFrames(frameScores, 10)
    expect(topFrames.length).toBe(5)
  }, 50000)

  it("should ordered by filename", () => {
    const frameScores = [
      {
        file: "01",
        score: 0.5,
      },
      {
        file: "02",
        score: 0.2,
      },
      {
        file: "03",
        score: 0.9,
      },
      {
        file: "04",
        score: 0.3,
      },
    ]
    const topFrames = selectKeyFrames(frameScores, 10)
    expect(isSortedByFilename(topFrames)).toBe(true)
  })
})

interface FrameScore {
  file: string
  score: number
}

function isSortedByFilename(frameScores: FrameScore[]): boolean {
  for (let i = 1; i < frameScores.length; i++) {
    if (frameScores[i - 1].file > frameScores[i].file) {
      return false
    }
  }
  return true
}
