const Image = require("../models/Image");
const axios = require("axios");
const fs = require("fs");

exports.uploadImage = async (req, res) => {
    const { modelType } = req.body;
    const userId = req.user.id;

    try {
        const file = req.file;

        // Send to FastAPI
        const formData = new FormData();
        formData.append("file", fs.createReadStream(file.path));
        formData.append("model_type", modelType);

        const response = await axios.post("http://localhost:8000/predict/", formData, {
            headers: formData.getHeaders(),
        });

        const newImage = new Image({
            user: userId,
            imagePath: file.path,
            modelType,
            prediction: response.data,
        });

        await newImage.save();
        res.json({ msg: "Image processed", result: response.data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
