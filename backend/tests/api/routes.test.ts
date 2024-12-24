import request from "supertest"
import app from "@/app" // Your app file
import { thumbnailGenerationQueue } from "@/jobs/thumbnailGeneration"

jest.setTimeout(30000) // Increase timeout if your tests require more time

describe("Thumbnail API Endpoints", () => {
  afterEach(async () => {
    // Clean up the queue after tests if necessary
    await thumbnailGenerationQueue.empty()
  })

  it("should start thumbnail generation", async () => {
    const response = await request(app).post("/api/generate-thumbnail").send({
      videoURL:
        "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_5MB.mp4",
    })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty(
      "message",
      "Thumbnail generation started"
    )
    expect(response.body).toHaveProperty("jobId")
    expect(response.body).toHaveProperty("status", "processing")

    // Verify the job exists in the queue
    const job = await thumbnailGenerationQueue.getJob(response.body.jobId)
    expect(job).toBeDefined()
    if (job) {
      expect(job.data).toMatchObject({
        videoURL:
          "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_5MB.mp4",
      })
    }
  })

  it("should return the job status", async () => {
    // Add a dummy job to the queue
    const job = await thumbnailGenerationQueue.add({
      videoURL:
        "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_5MB.mp4",
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
