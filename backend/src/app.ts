import express from "express"
import thumbnailRoutes from "@/api/routes"
import cors from "cors"
import { env } from "./config/env"

/**
 * Express server configuration for the thumbnail generation service.
 * Handles API routes, CORS, static file serving, and request logging.
 */

// Initialize Express application
const app = express()

/**
 * CORS Configuration
 * Restricts API access to specified frontend origin
 * TODO: Move this to environment config for different environments
 */
const corsOptions = {
  origin: "http://localhost:5173", // Frontend development server URL
}
app.use(cors(corsOptions))

/**
 * Middleware Setup
 */
// Request logging middleware
app.use((req, res, next) => {
  console.log(`Received ${req.method} request for ${req.url}`)
  next()
})

// Parse JSON request bodies
app.use(express.json())

/**
 * Route Configuration
 */
// Mount API routes under /api prefix
app.use("/api", thumbnailRoutes)

// Serve generated GIFs from assets directory
// Access via: http://localhost:PORT/gifs/filename.gif
app.use("/gifs", express.static("assets/gif"))

/**
 * Server Initialization
 * Uses PORT from environment variables or falls back to 3000
 */
const PORT = env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app
