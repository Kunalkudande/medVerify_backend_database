const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware"); // Make sure this is a function
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const Image = require("../models/Image");

// multer storage config
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});
const upload = multer({ storage });

router.post("/upload", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    console.log("Hello from image.js");

    const formData = new FormData();
    formData.append("file", fs.createReadStream(req.file.path));
    formData.append("model_type", req.body.modelType);

    const response = await axios.post("http://localhost:8000/predict/", formData, {
      headers: formData.getHeaders(),
    });

    const result = response.data;
    console.log(result);

    const newImage = new Image({
      user: req.user.id, // Make sure `req.user` is set by your auth middleware
      imagePath: req.file.path,
      modelType: req.body.modelType,
      prediction: result,
    });

    await newImage.save();

    res.json({ msg: "Image processed", result });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
