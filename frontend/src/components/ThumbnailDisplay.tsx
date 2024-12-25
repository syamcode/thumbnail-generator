import { Download } from "lucide-react"

type ThumbnailDisplayProps = {
  jobId: string
  onDownload: () => void
}

export function ThumbnailDisplay({ jobId, onDownload }: ThumbnailDisplayProps) {
  return (
    <div className="w-full max-w-xl">
      <div className="relative group">
        <img
          src={`/thumbnail/${jobId}`}
          alt="Generated Thumbnail"
          className="w-full rounded-lg shadow-lg"
        />
        <button
          onClick={onDownload}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Download className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </div>
  )
}
