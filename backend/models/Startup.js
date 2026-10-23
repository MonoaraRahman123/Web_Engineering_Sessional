const mongoose = require('mongoose');

const startupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Startup name is required'],
      trim: true,
    },
    sector: {
      type: String,
      required: [true, 'Sector is required'],
      trim: true,
      enum: ['K-12', 'Test Prep', 'Upskilling', 'Coding', 'Higher Education', 'Language Learning', 'Other'],
      default: 'K-12'
    },
    founders: {
      type: String,
      required: [true, 'Founder name(s) is required'],
      trim: true,
    },
    headquarters: {
      type: String,
      required: [true, 'Headquarters location is required'],
      trim: true,
      default: 'Dhaka, Bangladesh',
    },
    yearFounded: {
      type: Number,
      required: [true, 'Year founded is required'],
      min: [1990, 'Year must be 1990 or later'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the far future'],
    },
    totalFunding: {
      type: Number,
      required: [true, 'Total funding amount is required'],
      min: [0, 'Funding cannot be negative'],
      default: 0,
    },
    logoUrl: {
      type: String,
      required: [true, 'Logo URL is required'],
      trim: true,
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    }
  },
  {
    timestamps: true,
  }
);

// Index for search optimization
startupSchema.index({ name: 'text', sector: 'text' });

module.exports = mongoose.model('Startup', startupSchema);
