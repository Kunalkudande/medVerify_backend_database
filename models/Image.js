const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  imagePath: {
    type: String,
    required: true,
  },
  modelType: {
    type: String,
    enum: ['chest', 'knee'],
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  prediction: {
    prediction: { type: String, required: true },
    confidence: { type: Number, required: true },
    description: { type: String }, // Optional for 'knee'
  },
});

module.exports = mongoose.model('Image', ImageSchema);
