const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Image = require("../models/Image");
const fs = require("fs");

// GET /api/history/:email
router.get("/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const images = await Image.find({ user: user._id }).sort({ uploadedAt: -1 });

    const history = images.map((img) => {
      let image_base64 = "";
      try {
        const buffer = fs.readFileSync(img.imagePath);
        image_base64 = buffer.toString("base64");
      } catch (err) {
        console.error("Error reading image file:", err);
      }

      return {
        image_type: img.modelType,
        prediction: img.prediction.prediction,
        confidence: img.prediction.confidence,
        description: img.prediction.description || "",
        image_base64,
        timestamp: img.uploadedAt,
      };
    });

    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
