const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  totalImages: {
    type: Number,
    default: 0,
    min: 0
  },
  totalOriginalSize: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCompressedSize: {
    type: Number,
    default: 0,
    min: 0
  },
  averageCompression: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  qualityDistribution: {
    high: { 
      type: Number, 
      default: 0,
      min: 0
    },
    medium: { 
      type: Number, 
      default: 0,
      min: 0
    },
    low: { 
      type: Number, 
      default: 0,
      min: 0
    }
  },
  fileTypeDistribution: {
    type: Map,
    of: {
      type: Number,
      min: 0
    },
    default: {}
  },
  sizeReductionStats: {
    excellent: { 
      type: Number, 
      default: 0,
      min: 0
    },
    good: { 
      type: Number, 
      default: 0,
      min: 0
    },
    moderate: { 
      type: Number, 
      default: 0,
      min: 0
    },
    low: { 
      type: Number, 
      default: 0,
      min: 0
    }
  },
  bestCompression: {
    efficiency: {
      type: Number,
      min: 0,
      max: 100
    },
    quality: {
      type: Number,
      min: 0,
      max: 100
    },
    originalSize: {
      type: Number,
      min: 0
    },
    compressedSize: {
      type: Number,
      min: 0
    }
  },
  worstCompression: {
    efficiency: {
      type: Number,
      min: 0,
      max: 100
    },
    quality: {
      type: Number,
      min: 0,
      max: 100
    },
    originalSize: {
      type: Number,
      min: 0
    },
    compressedSize: {
      type: Number,
      min: 0
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Method to update analytics
AnalyticsSchema.methods.updateAnalytics = async function(images) {
  const totalImages = images.length;
  const totalOriginalSize = images.reduce((sum, img) => sum + img.originalSize, 0);
  const totalCompressedSize = images.reduce((sum, img) => sum + img.compressedSize, 0);
  const averageCompression = totalImages > 0 
    ? ((1 - totalCompressedSize / totalOriginalSize) * 100).toFixed(1)
    : 0;

  // Update quality distribution
  const qualityDistribution = {
    high: images.filter(img => img.quality >= 80).length,
    medium: images.filter(img => img.quality >= 50 && img.quality < 80).length,
    low: images.filter(img => img.quality < 50).length,
  };

  // Update file type distribution
  const fileTypeDistribution = images.reduce((acc, img) => {
    const type = img.fileType;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Update size reduction stats
  const sizeReductionStats = {
    excellent: images.filter(img => img.compressionPercentage >= 70).length,
    good: images.filter(img => img.compressionPercentage >= 50 && img.compressionPercentage < 70).length,
    moderate: images.filter(img => img.compressionPercentage >= 30 && img.compressionPercentage < 50).length,
    low: images.filter(img => img.compressionPercentage < 30).length,
  };

  // Find best and worst compression
  const sortedByEfficiency = [...images].sort((a, b) => b.compressionPercentage - a.compressionPercentage);
  const bestCompression = sortedByEfficiency[0];
  const worstCompression = sortedByEfficiency[sortedByEfficiency.length - 1];

  // Update the document
  this.totalImages = totalImages;
  this.totalOriginalSize = totalOriginalSize;
  this.totalCompressedSize = totalCompressedSize;
  this.averageCompression = averageCompression;
  this.qualityDistribution = qualityDistribution;
  this.fileTypeDistribution = fileTypeDistribution;
  this.sizeReductionStats = sizeReductionStats;
  this.bestCompression = bestCompression ? {
    efficiency: bestCompression.compressionPercentage,
    quality: bestCompression.quality,
    originalSize: bestCompression.originalSize,
    compressedSize: bestCompression.compressedSize,
  } : null;
  this.worstCompression = worstCompression ? {
    efficiency: worstCompression.compressionPercentage,
    quality: worstCompression.quality,
    originalSize: worstCompression.originalSize,
    compressedSize: worstCompression.compressedSize,
  } : null;
  this.lastUpdated = new Date();

  return this.save();
};

// Create indexes for better query performance
AnalyticsSchema.index({ lastUpdated: -1 });
AnalyticsSchema.index({ 'qualityDistribution.high': -1 });
AnalyticsSchema.index({ 'sizeReductionStats.excellent': -1 });

const Analytics = mongoose.model('Analytics', AnalyticsSchema);

module.exports = Analytics; 