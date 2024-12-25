import React, { useState } from "react"
import { Link } from "lucide-react"

type VideoUrlInputProps = {
  onSubmit: (url: string) => void
  isProcessing: boolean
}

export function VideoUrlInput({ onSubmit, isProcessing }: VideoUrlInputProps) {
  const [url, setUrl] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      onSubmit(url.trim())
    }
  }

  return (
    <div className="flex justify-center items-center">
      <form onSubmit={handleSubmit} className="w-full max-w-xl">
        <div className="flex items-center gap-2 p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:border-blue-300 transition-colors">
          <Link className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter video URL (e.g., https://example.com/video.mp4)"
            className="flex-1 border-0 focus:ring-0 text-gray-800 placeholder-gray-400 bg-transparent"
            required
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={isProcessing || !url.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
          >
            {isProcessing ? "Processing..." : "Generate"}
          </button>
        </div>
      </form>
    </div>
  )
}
