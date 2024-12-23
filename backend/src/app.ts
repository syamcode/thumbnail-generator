import express from "express"
import thumbnailRoutes from "@/api/routes"

const app = express()
app.use(express.json())
app.use("/api", thumbnailRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
