const cloudinary = require('cloudinary').v2;
const multer = require('multer');

const errorResponse = (res, statusCode, message) => {
    return res.status(statusCode).json({
        success : false,
        message
    });
};

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_CLOUD_API_KEY,
    api_secret:process.env.CLOUDINARY_CLOUD_API_SECRET,
});


const uploadFiles = multer({ storage : multer.memoryStorage()});

module.exports = {
    errorResponse,
    uploadFiles,
};