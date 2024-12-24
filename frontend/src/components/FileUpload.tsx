import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';

type FileUploadProps = {
  onUpload: (file: File) => void;
  isUploading: boolean;
};

export function FileUpload({ onUpload, isUploading }: FileUploadProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('video/')) {
        onUpload(file);
      }
    },
    [onUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onUpload(file);
      }
    },
    [onUpload]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="w-full max-w-xl p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <Upload className="w-12 h-12 text-gray-400" />
        <div className="text-center">
          <p className="text-lg font-medium text-gray-700">
            {isUploading ? 'Uploading...' : 'Drag and drop your video here'}
          </p>
          <p className="text-sm text-gray-500">or</p>
          <label className="mt-2 inline-block">
            <input
              type="file"
              className="hidden"
              accept="video/*"
              onChange={handleFileInput}
              disabled={isUploading}
            />
            <span className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 cursor-pointer">
              Select Video
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}