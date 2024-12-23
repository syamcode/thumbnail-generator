import { generateGifFromFrames } from "@/services/thumbnailGenerator"
import fs from "fs"

describe("Generate gif", () => {
  it("can generate gif", async () => {
    const outputPath = "tests/fixtures/output.gif"
    await generateGifFromFrames(
      [
        "tests/fixtures/test_gif/output_0001.jpg",
        "tests/fixtures/test_gif/output_0002.jpg",
        "tests/fixtures/test_gif/output_0003.jpg",
        "tests/fixtures/test_gif/output_0004.jpg",
        "tests/fixtures/test_gif/output_0005.jpg",
        "tests/fixtures/test_gif/output_0006.jpg",
        "tests/fixtures/test_gif/output_0007.jpg",
      ],
      outputPath
    )

    expect(fs.existsSync(outputPath)).toBe(true)
  })
})

describe("Return error", () => {
  it("should throw error when no frames are provided", async () => {
    await expect(generateGifFromFrames([], "output.gif")).rejects.toThrow(
      "No input frames provided"
    )
  })

  it("should throw error when input frame is not found", async () => {
    await expect(
      generateGifFromFrames(["nonexistent.jpg"], "output.gif")
    ).rejects.toThrow("Input frame not found: nonexistent.jpg")
  })
})
