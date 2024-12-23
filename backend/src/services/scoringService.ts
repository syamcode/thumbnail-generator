interface FrameScore {
  file: string
  score: number
}

export function calculateVisualAppealScores(
  sceneFrames: string[]
): FrameScore[] {
  return sceneFrames.map((file) => ({
    file,
    score: Math.random() * 100, // Random score for now
  }))
}

export function selectKeyFrames(
  appealScores: FrameScore[],
  topN: number = 10
): FrameScore[] {
  return appealScores.sort((a, b) => b.score - a.score).slice(0, topN)
}
