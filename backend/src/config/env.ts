import { config as loadDotenv } from "dotenv"
import { z } from "zod"

// Load .env file only in non-production environments
if (process.env.NODE_ENV !== "production") {
  const result = loadDotenv()
  if (result.error) {
    console.warn(
      "⚠️  .env file not found, falling back to system environment variables."
    )
  }
}

// Define environment variable schema
const envSchema = z.object({
  // Server configs
  PORT: z.string().default("3000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  GIF_URL: z.string().default("http://localhost:3000/gifs"),

  // Redis configs for Bull
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.string().default("6379"),
  REDIS_PASSWORD: z.string().optional(),
})

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env) // Validate against process.env
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(
        "❌ Invalid environment variables:",
        JSON.stringify(error.errors, null, 2)
      )
      process.exit(1)
    }
    throw error // Re-throw unexpected errors
  }
}

// Export validated environment variables
export const env = parseEnv()

// Export Redis connection config for Bull
export const redisConfig = {
  redis: {
    host: env.REDIS_HOST,
    port: parseInt(env.REDIS_PORT, 10),
    password: env.REDIS_PASSWORD,
  },
}
