import express from "express"
import thumbnailRoutes from "@/api/routes"
import cors from "cors"
import { env } from "./config/env"
const path = require("path")

const app = express()

const corsOptions = {
  origin: "http://localhost:5173", // Replace with your frontend URL
}

app.use(cors(corsOptions))

app.use(express.json())
app.use("/api", thumbnailRoutes)

// Serve the assets/gifs folder as a static directory
app.use("/gifs", express.static("assets/gif"))

const PORT = env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app
