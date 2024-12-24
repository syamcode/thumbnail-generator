import express from "express"
import thumbnailRoutes from "@/api/routes"
const path = require("path")

const app = express()
app.use(express.json())
app.use("/api", thumbnailRoutes)

// Serve the assets/gifs folder as a static directory
app.use("/gifs", express.static("assets/gif"))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app
