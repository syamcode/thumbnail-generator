// jest.setup.ts
import { Queue } from "bull"

// Define types for environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test"
      PORT: string
      REDIS_HOST: string
      REDIS_PORT: string
      REDIS_PASSWORD?: string
    }
  }
}

// Set up test environment variables
process.env.NODE_ENV = "test"
process.env.PORT = "3000"
process.env.REDIS_HOST = "localhost"
process.env.REDIS_PORT = "6379"

// Optional: Add global test setup/teardown if needed
beforeAll(() => {
  // Global setup code if needed
  console.log("Starting tests with environment:", process.env.NODE_ENV)
})

afterAll(() => {
  // Global cleanup code if needed
})

export {}
