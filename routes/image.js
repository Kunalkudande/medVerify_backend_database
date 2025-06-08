const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const Image = require("../models/Image");

const storage = multer.memoryStorage(); // ✅ memory storage
const upload = multer({ storage });

router.post("/upload", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    console.log("Hello from image.js");

    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    formData.append("model_type", req.body.modelType);

    const response = await axios.post(
      "http://localhost:8000/predict/",
      formData,
      { headers: formData.getHeaders() }
    );

    const result = response.data;

    const newImage = new Image({
      user: req.user.id,
      modelType: req.body.modelType,
      prediction: result,
      imageBase64: req.file.buffer.toString("base64"), // Optional
    });

    await newImage.save();
    res.json({ msg: "Image processed", result });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
