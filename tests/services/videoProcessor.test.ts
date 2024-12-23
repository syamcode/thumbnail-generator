import { extractFrames } from "@/services/videoProcessor"

import fs from "fs"

const outputDir = "tests/fixtures/frames"

beforeEach(() => {
  // Ensure the directory exists and is empty
  if (fs.existsSync(outputDir)) {
    fs.rmdirSync(outputDir, { recursive: true })
  }
  fs.mkdirSync(outputDir, { recursive: true })
})

afterEach(() => {
  // Clean up by removing the output directory
  if (fs.existsSync(outputDir)) {
    fs.rmdirSync(outputDir, { recursive: true })
  }
})

test("will extract 1 frame per second", async () => {
  const videoPath = "tests/fixtures/video.mp4"
  const frames = await extractFrames(videoPath, outputDir)
  expect(frames.length).toBe(15)
})

test("will return error if video does not exist", async () => {
  const videoPath = "tests/fixtures/nonexistent.mp4"
  await expect(extractFrames(videoPath, outputDir)).rejects.toThrow()
})

test("will return error if input is not a video", async () => {
  const videoPath = "tests/fixtures/not_a_video.txt"
  await expect(extractFrames(videoPath, outputDir)).rejects.toThrow()
})

test("will extract at minimum 5 frames", async () => {
  const videoPath = "tests/fixtures/one_second.mp4"
  const frames = await extractFrames(videoPath, outputDir)
  expect(frames.length).toBe(5)
})

test("will clean directory before doing the process", async () => {
  const videoPath1 = "tests/fixtures/video.mp4"
  const videoPath2 = "tests/fixtures/one_second.mp4"
  await extractFrames(videoPath1, outputDir)
  const frames = await extractFrames(videoPath2, outputDir)
  expect(frames.length).toBe(5)
}, 10000)
