import axios from "axios"
import { URL } from "url"
import contentType from "content-type"
import path, { parse } from "path"
import { promises as fs, createWriteStream } from "fs"
import mime from "mime-types"

// Types
interface VideoDownloadResponse {
  success: boolean
  message: string
  filePath?: string
}

interface VideoConfig {
  allowedTypes: string[]
  maxFileSize: number
}

// Constants
const DEFAULT_CONFIG: VideoConfig = {
  allowedTypes: ["video/mp4", "video/webm", "video/ogg", "video/quicktime"],
  maxFileSize: 100 * 1024 * 1024, // 100MB
}

/**
 * Download a video file from a URL to a specified path
 * @param url - Source URL of the video
 * @param destinationPath - Path where the video should be saved
 * @param config - Optional configuration for download restrictions
 */
export async function downloadVideo(
  url: string,
  destinationPath: string,
  config: Partial<VideoConfig> = {}
): Promise<VideoDownloadResponse> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }

  try {
    // Validate URL
    validateUrl(url)

    // Validate content type and size
    const validation = await validateVideoMetadata(url, finalConfig)
    if (!validation.success) {
      return validation
    }

    // Ensure destination directory exists
    await ensureDirectoryExists(destinationPath)

    // Download and save the video
    return await downloadAndSaveVideo(url, destinationPath)
  } catch (error) {
    return {
      success: false,
      message: `Download failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    }
  }
}

/**
 * Validate URL format
 */
function validateUrl(url: string): void {
  try {
    new URL(url)
  } catch (error) {
    throw new Error("Invalid URL format")
  }
}

/**
 * Validate video metadata including content type and size
 */
async function validateVideoMetadata(
  url: string,
  config: VideoConfig
): Promise<VideoDownloadResponse> {
  const headResponse = await axios.head(url)
  const contentTypeHeader = headResponse.headers["content-type"]
  const contentLength = parseInt(headResponse.headers["content-length"] || "0")

  // Check Content-Type
  if (contentTypeHeader) {
    const parsedContentType = contentType.parse(contentTypeHeader)
    if (config.allowedTypes.includes(parsedContentType.type)) {
      if (contentLength > config.maxFileSize) {
        return {
          success: false,
          message: `File size exceeds maximum allowed size of ${
            config.maxFileSize / (1024 * 1024)
          }MB`,
        }
      }
      return { success: true, message: "Video metadata validation passed" }
    }
  }

  // Fallback: Check file extension
  const urlPath = new URL(url).pathname
  const extension = path.extname(urlPath).toLowerCase()
  const mimeType = mime.lookup(extension)

  if (mimeType && config.allowedTypes.includes(mimeType)) {
    if (contentLength > config.maxFileSize) {
      return {
        success: false,
        message: `File size exceeds maximum allowed size of ${
          config.maxFileSize / (1024 * 1024)
        }MB`,
      }
    }
    return { success: true, message: "Video metadata validation passed" }
  }

  return {
    success: false,
    message: `Invalid file type. Only ${config.allowedTypes.join(
      ", "
    )} are allowed`,
  }
}

/**
 * Ensure the destination directory exists
 */
async function ensureDirectoryExists(filePath: string): Promise<void> {
  const dir = path.dirname(filePath)
  await fs.mkdir(dir, { recursive: true })
}

/**
 * Download and save the video file
 */
async function downloadAndSaveVideo(
  url: string,
  destinationPath: string
): Promise<VideoDownloadResponse> {
  const response = await axios({
    method: "GET",
    url: url,
    responseType: "stream",
  })

  const writer = createWriteStream(destinationPath)
  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on("finish", () => {
      resolve({
        success: true,
        message: "Video downloaded successfully",
        filePath: destinationPath,
      })
    })

    writer.on("error", async (err: Error) => {
      try {
        await fs.unlink(destinationPath)
      } catch {
        // Ignore cleanup errors
      }
      reject({
        success: false,
        message: `Error writing file: ${err.message}`,
      })
    })
  })
}
