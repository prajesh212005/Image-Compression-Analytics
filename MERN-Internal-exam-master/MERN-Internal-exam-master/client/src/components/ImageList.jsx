import React from 'react';
import { useImageContext } from '../context/ImageContext';
import { formatBytes, formatDate } from '../utils/formatting';
import { ArrowDownTrayIcon, TrashIcon } from '@heroicons/react/24/outline';

const ImageList = () => {
  const { images, deleteCompressedImage, addActivityLog } = useImageContext();

  const handleDownload = async (image) => {
    try {
      const response = await fetch(image.compressedUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `compressed_${image.fileName}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      addActivityLog('Download', 'success', `Downloaded compressed image: ${image.fileName}`);
    } catch (error) {
      console.error('Error downloading image:', error);
      addActivityLog('Download', 'error', `Failed to download image: ${image.fileName}`);
    }
  };

  const handleDelete = (imageId) => {
    deleteCompressedImage(imageId);
    addActivityLog('Delete', 'success', `Deleted image with ID: ${imageId}`);
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">No compressed images</h3>
        <p className="mt-1 text-sm text-gray-500">Upload and compress some images to see them here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((image) => (
        <div key={image.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Image Preview */}
          <div className="relative aspect-video bg-gray-100">
            <img
              src={image.compressedUrl}
              alt={image.fileName}
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {image.fileName}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDownload(image)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Download"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(image.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Compression:</span>
                <span className="font-medium text-gray-900">{image.compressionEfficiency}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Original Size:</span>
                <span className="font-medium text-gray-900">{formatBytes(image.originalSize)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Compressed Size:</span>
                <span className="font-medium text-gray-900">{formatBytes(image.compressedSize)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Quality:</span>
                <span className="font-medium text-gray-900">{image.quality}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date:</span>
                <span className="font-medium text-gray-900">{formatDate(image.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageList; 