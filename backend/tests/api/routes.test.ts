import request from "supertest"
import app from "@/app"
import { thumbnailGenerationQueue } from "@/jobs/thumbnailGeneration"

jest.setTimeout(30000)

describe("Thumbnail API Endpoints", () => {
  const TEST_VIDEO_URL =
    "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_5MB.mp4"

  afterEach(async () => {
    await thumbnailGenerationQueue.empty()
  })

  it("should start thumbnail generation", async () => {
    const response = await request(app)
      .post("/api/generate-thumbnail")
      .send({ videoURL: TEST_VIDEO_URL })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty(
      "message",
      "Thumbnail generation started"
    )
    expect(response.body).toHaveProperty("jobId")
    expect(response.body).toHaveProperty("status", "processing")

    const job = await thumbnailGenerationQueue.getJob(response.body.jobId)
    expect(job).toBeDefined()
    if (job) {
      expect(job.data).toMatchObject({ videoURL: TEST_VIDEO_URL })
    }
  })

  it("should return the job status", async () => {
    const job = await thumbnailGenerationQueue.add({
      videoURL: TEST_VIDEO_URL,
    })

    const response = await request(app).get(`/api/thumbnail-status/${job.id}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("jobId", job.id)
    expect(response.body).toHaveProperty("state")
  })

  it("should return 404 for a non-existent job", async () => {
    const response = await request(app).get(
      "/api/thumbnail-status/non-existent-id"
    )

    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty("error", "Job not found")
  })
})
