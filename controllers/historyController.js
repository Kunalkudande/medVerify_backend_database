const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Image = require("../models/Image");

// GET /api/history/:email
router.get("/:email", async (req, res) => {
  try {
    const { email } = req.params;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Get user's image prediction history
    const images = await Image.find({ user: user._id }).sort({ uploadedAt: -1 });

    // Prepare response
    const history = images.map((img) => ({
      image_type: img.modelType,
      prediction: img.prediction.prediction,
      confidence: img.prediction.confidence,
      description: img.prediction.description || "",
      imagePath: img.imagePath, // Cloudinary URL
      timestamp: img.uploadedAt,
    }));

    res.json(history);
  } catch (error) {
    console.error("Error in history route:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
