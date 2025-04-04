import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useImageContext } from '../context/ImageContext';
import ImageList from '../components/ImageList';
import { formatBytes } from '../utils/formatting';

const Dashboard = () => {
  const { addCompressedImage, addActivityLog } = useImageContext();
  const [qualitySlider, setQualitySlider] = useState(80);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to convert data URL to File object
  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          const maxDimension = 1200; // Maximum dimension for compressed image

          if (width > height && width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw image with high quality
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to JPEG with quality based on slider value
          const compressionQuality = qualitySlider / 100;
          const dataUrl = canvas.toDataURL('image/jpeg', compressionQuality);

          // Create a blob from the data URL
          const base64Data = dataUrl.split(',')[1];
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'image/jpeg' });

          // If compressed size is larger than original, reduce quality further
          if (blob.size > file.size) {
            // Try with lower quality
            const lowerQuality = Math.max(0.1, compressionQuality - 0.1);
            const lowerQualityDataUrl = canvas.toDataURL('image/jpeg', lowerQuality);
            const lowerQualityBase64 = lowerQualityDataUrl.split(',')[1];
            const lowerQualityBinary = atob(lowerQualityBase64);
            const lowerQualityBytes = new Uint8Array(lowerQualityBinary.length);
            for (let i = 0; i < lowerQualityBinary.length; i++) {
              lowerQualityBytes[i] = lowerQualityBinary.charCodeAt(i);
            }
            const lowerQualityBlob = new Blob([lowerQualityBytes], { type: 'image/jpeg' });

            if (lowerQualityBlob.size < file.size) {
              resolve({
                compressedUrl: lowerQualityDataUrl,
                compressedSize: lowerQualityBlob.size,
                quality: Math.round(lowerQuality * 100)
              });
            } else {
              // If still too large, try with even lower quality
              const minQuality = 0.1;
              const minQualityDataUrl = canvas.toDataURL('image/jpeg', minQuality);
              const minQualityBase64 = minQualityDataUrl.split(',')[1];
              const minQualityBinary = atob(minQualityBase64);
              const minQualityBytes = new Uint8Array(minQualityBinary.length);
              for (let i = 0; i < minQualityBinary.length; i++) {
                minQualityBytes[i] = minQualityBinary.charCodeAt(i);
              }
              const minQualityBlob = new Blob([minQualityBytes], { type: 'image/jpeg' });
              
              resolve({
                compressedUrl: minQualityDataUrl,
                compressedSize: minQualityBlob.size,
                quality: Math.round(minQuality * 100)
              });
            }
          } else {
            resolve({
              compressedUrl: dataUrl,
              compressedSize: blob.size,
              quality: qualitySlider
            });
          }
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const onDrop = async (acceptedFiles) => {
    try {
      setError(null);
      setUploading(true);

      const file = acceptedFiles[0];
      if (!file) {
        throw new Error('No file selected');
      }

      // Validate file type
      if (!file.type.match(/image\/(jpeg|png|webp)/)) {
        throw new Error('Please upload a valid image file (JPEG, PNG, or WEBP)');
      }

      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size should be less than 5MB');
      }

      // Compress image
      const compressedResult = await compressImage(file);

      // Calculate compression percentage
      const compressionPercentage = ((file.size - compressedResult.compressedSize) / file.size) * 100;

      // Create compressed image object
      const compressedImage = {
        id: Date.now().toString(),
        fileName: file.name,
        originalSize: file.size,
        compressedSize: compressedResult.compressedSize,
        quality: compressedResult.quality,
        compressedUrl: compressedResult.compressedUrl,
        compressionEfficiency: Math.round(compressionPercentage),
        fileType: file.type.split('/')[1].toUpperCase(),
        createdAt: new Date().toISOString()
      };

      // Add to context
      addCompressedImage(compressedImage);

      // Add activity log
      addActivityLog('Upload', 'success', `Uploaded and compressed ${file.name}`);

    } catch (err) {
      setError(err.message);
      addActivityLog('Upload', 'error', err.message);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Image Compression Dashboard</h1>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <span className="text-gray-600">Compressing image...</span>
              </div>
            ) : (
              <>
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="mt-4 text-lg font-medium text-gray-900">
                  {isDragActive
                    ? 'Drop the image here'
                    : 'Drag and drop an image, or click to select'}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Supported formats: JPEG, PNG, WEBP (Max size: 5MB)
                </p>
              </>
            )}
          </div>

          {/* Quality Slider */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="quality" className="text-sm font-medium text-gray-700">
                Compression Quality
              </label>
              <span className="text-sm font-medium text-gray-900">{qualitySlider}%</span>
            </div>
            <input
              type="range"
              id="quality"
              min="1"
              max="100"
              value={qualitySlider}
              onChange={(e) => setQualitySlider(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Maximum Compression</span>
              <span>Best Quality</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Image List */}
        <ImageList />
      </div>
    </div>
  );
};

export default Dashboard; 