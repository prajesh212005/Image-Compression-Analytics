import React, { createContext, useContext, useState, useEffect } from 'react';

const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
  const [images, setImages] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load images from localStorage
        const savedImages = JSON.parse(localStorage.getItem('compressedImages') || '[]');
        setImages(savedImages);

        // Calculate analytics
        const analyticsData = calculateAnalytics(savedImages);
        setAnalytics(analyticsData);

        // Load activity logs from localStorage
        const savedLogs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
        setActivityLogs(savedLogs);
      } catch (error) {
        console.error('Error loading data:', error);
        addActivityLog('Error loading data', 'error', error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate analytics from images
  const calculateAnalytics = (images) => {
    if (!images || images.length === 0) {
      return {
        totalImages: 0,
        totalOriginalSize: 0,
        totalCompressedSize: 0,
        qualityDistribution: {
          high: 0,
          medium: 0,
          low: 0
        },
        fileTypeDistribution: {},
        sizeReductionStats: {
          excellent: 0,
          good: 0,
          moderate: 0,
          low: 0
        },
        bestCompression: {
          efficiency: 0,
          quality: 0,
          originalSize: 0,
          compressedSize: 0
        },
        worstCompression: {
          efficiency: 100,
          quality: 0,
          originalSize: 0,
          compressedSize: 0
        }
      };
    }

    let totalOriginalSize = 0;
    let totalCompressedSize = 0;
    let qualityDistribution = {
      high: 0,
      medium: 0,
      low: 0
    };
    let fileTypeDistribution = {};
    let sizeReductionStats = {
      excellent: 0,
      good: 0,
      moderate: 0,
      low: 0
    };
    let bestCompression = {
      efficiency: 0,
      quality: 0,
      originalSize: 0,
      compressedSize: 0
    };
    let worstCompression = {
      efficiency: 100,
      quality: 0,
      originalSize: 0,
      compressedSize: 0
    };

    // Filter out deleted images
    const activeImages = images.filter(img => !img.deleted);
    
    activeImages.forEach(image => {
      totalOriginalSize += image.originalSize;
      totalCompressedSize += image.compressedSize;
      
      // Calculate compression percentage for this image
      const compression = ((image.originalSize - image.compressedSize) / image.originalSize) * 100;

      // Update quality distribution
      if (image.quality >= 80) qualityDistribution.high++;
      else if (image.quality >= 50) qualityDistribution.medium++;
      else qualityDistribution.low++;

      // Update file type distribution
      const fileType = image.fileType.toLowerCase();
      fileTypeDistribution[fileType] = (fileTypeDistribution[fileType] || 0) + 1;

      // Update size reduction stats
      if (compression >= 70) sizeReductionStats.excellent++;
      else if (compression >= 50) sizeReductionStats.good++;
      else if (compression >= 30) sizeReductionStats.moderate++;
      else sizeReductionStats.low++;

      // Update best compression
      if (compression > bestCompression.efficiency) {
        bestCompression = {
          efficiency: compression,
          quality: image.quality,
          originalSize: image.originalSize,
          compressedSize: image.compressedSize
        };
      }

      // Update worst compression
      if (compression < worstCompression.efficiency) {
        worstCompression = {
          efficiency: compression,
          quality: image.quality,
          originalSize: image.originalSize,
          compressedSize: image.compressedSize
        };
      }
    });

    return {
      totalImages: activeImages.length,
      totalOriginalSize,
      totalCompressedSize,
      qualityDistribution,
      fileTypeDistribution,
      sizeReductionStats,
      bestCompression,
      worstCompression
    };
  };

  // Add activity log
  const addActivityLog = (action, status, details = '') => {
    const newLog = {
      timestamp: new Date().toISOString(),
      action,
      status,
      details
    };

    setActivityLogs(prevLogs => {
      const updatedLogs = [newLog, ...prevLogs].slice(0, 100); // Keep last 100 logs
      localStorage.setItem('activityLogs', JSON.stringify(updatedLogs));
      return updatedLogs;
    });
  };

  // Add compressed image
  const addCompressedImage = (image) => {
    // Calculate compression percentage (positive value)
    const compressionPercentage = ((image.originalSize - image.compressedSize) / image.originalSize) * 100;
    
    const newImage = {
      ...image,
      compressionPercentage: Math.round(compressionPercentage),
      createdAt: new Date().toISOString()
    };

    setImages(prevImages => {
      const updatedImages = [newImage, ...prevImages];
      localStorage.setItem('compressedImages', JSON.stringify(updatedImages));
      return updatedImages;
    });

    // Update analytics
    const updatedAnalytics = calculateAnalytics([newImage, ...images]);
    setAnalytics(updatedAnalytics);

    // Add activity log
    addActivityLog('Image compressed', 'success', `Compressed ${image.fileName} with ${Math.round(compressionPercentage)}% reduction`);
  };

  // Delete compressed image
  const deleteCompressedImage = (imageId) => {
    setImages(prevImages => {
      const updatedImages = prevImages.filter(img => img.id !== imageId);
      localStorage.setItem('compressedImages', JSON.stringify(updatedImages));
      
      // Update analytics
      const updatedAnalytics = calculateAnalytics(updatedImages);
      setAnalytics(updatedAnalytics);

      return updatedImages;
    });

    addActivityLog('Image deleted', 'success', `Deleted image with ID: ${imageId}`);
  };

  return (
    <ImageContext.Provider
      value={{
        images,
        analytics,
        activityLogs,
        loading,
        addCompressedImage,
        deleteCompressedImage,
        addActivityLog
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};

export const useImageContext = () => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error('useImageContext must be used within an ImageProvider');
  }
  return context;
}; 