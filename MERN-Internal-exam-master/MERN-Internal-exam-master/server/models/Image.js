const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true,
    index: true
  },
  originalSize: {
    type: Number,
    required: [true, 'Original size is required'],
    min: [1, 'Original size must be greater than 0']
  },
  compressedSize: {
    type: Number,
    required: [true, 'Compressed size is required'],
    min: [1, 'Compressed size must be greater than 0'],
    validate: {
      validator: function(v) {
        return v <= this.originalSize;
      },
      message: 'Compressed size must be less than or equal to original size'
    }
  },
  quality: {
    type: Number,
    required: [true, 'Quality is required'],
    min: [1, 'Quality must be between 1 and 100'],
    max: [100, 'Quality must be between 1 and 100']
  },
  compressedUrl: {
    type: String,
    required: [true, 'Compressed URL is required'],
    trim: true
  },
  compressionEfficiency: {
    type: Number,
    required: [true, 'Compression efficiency is required'],
    min: [0, 'Compression efficiency must be between 0 and 100'],
    max: [100, 'Compression efficiency must be between 0 and 100']
  },
  fileType: {
    type: String,
    required: [true, 'File type is required'],
    enum: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    lowercase: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Add a virtual field for compression percentage
ImageSchema.virtual('compressionPercentage').get(function() {
  return ((1 - this.compressedSize / this.originalSize) * 100).toFixed(1);
});

// Add a virtual field for space saved
ImageSchema.virtual('spaceSaved').get(function() {
  return this.originalSize - this.compressedSize;
});

// Add a method to get quality category
ImageSchema.methods.getQualityCategory = function() {
  if (this.quality >= 80) return 'high';
  if (this.quality >= 50) return 'medium';
  return 'low';
};

// Add a method to get compression category
ImageSchema.methods.getCompressionCategory = function() {
  const percentage = this.compressionPercentage;
  if (percentage >= 70) return 'excellent';
  if (percentage >= 50) return 'good';
  if (percentage >= 30) return 'moderate';
  return 'low';
};

// Create compound indexes for common queries
ImageSchema.index({ fileType: 1, quality: 1 });
ImageSchema.index({ createdAt: -1, compressionEfficiency: -1 });

const Image = mongoose.model('Image', ImageSchema);

module.exports = Image; 