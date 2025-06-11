const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const axios = require("axios");
const FormData = require("form-data");
const Image = require("../models/Image");

// Cloudinary config
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage setup
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "medverify_uploads",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});
const upload = multer({ storage });

router.post("/upload", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    // Download the file from Cloudinary to a buffer
    const imageUrl = req.file.path;

    // Stream the image file from the Cloudinary URL
    const imageResponse = await axios.get(imageUrl, { responseType: "stream" });

    const formData = new FormData();
    formData.append("file", imageResponse.data, {
      filename: "uploaded_image.jpg",
      contentType: "image/jpeg",
    });
    formData.append("model_type", req.body.modelType);

    const response = await axios.post("https://kunal0909-medverify-backend-prediction.hf.space/predict/", formData, {
      headers: formData.getHeaders(),
    });

    const result = response.data;

    const newImage = new Image({
      user: req.user.id,
      imagePath: imageUrl, // Store Cloudinary image URL
      modelType: req.body.modelType,
      prediction: result,
    });

    await newImage.save();

    res.json({ msg: "Image processed successfully", result, imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
