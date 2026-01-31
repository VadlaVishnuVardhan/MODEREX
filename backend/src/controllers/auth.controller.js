const User = require("../models/user.model");
const { errorResponse } = require("../utils/utils");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');


const userRegister = async(req, res) => {
    try {
        const {name, email, password} = req.body || {};
        if(!name || !email || !password){
            return errorResponse(res, 400, 'Please provide all required fields.');
        }
        const user = await User.findOne({email});
        if(user){
            return errorResponse(res, 400, 'User already exists with this email.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            name,   
            email,
            password: hashedPassword
        });
        return res.status(201).json({
            success: true,
            message: 'User registered successfully.'
        });
    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
}; 

const userLogin = async(req, res) => {
    try {
        const {email, password} = req.body || {};
        if(!email || !password){
            return errorResponse(res, 404, 'Please provide Email and Password');
        }

        const user = await User.findOne({email});
        if(!user){
            return errorResponse(res, 404, 'No user found with this email.');
        }
        const matchPassword = await bcrypt.compare(password, user.password);
        if(!matchPassword){
            return errorResponse(res, 401, 'Invalid Password.');
        }

        const secret = process.env.JWT_SECRET || 'dev_insecure_secret_change_me';
        const token = jwt.sign({
            id: user._id,
            isAdmin: user.isAdmin || false
        }, secret, {
            expiresIn: '7d'
        });

        // SET Cookie
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('token', token, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            maxAge: 7*24*60*60*1000, // 7 days
        })
        return res.status(200).json({
            success: true,
            message: 'User logged in successfully.'
        });

    }catch (error) {
        console.log(error.message);
        return errorResponse(res, 500, error.message);
    }
}

const userLogout = async(req, res) => {
    try {
        const isProdLogout = process.env.NODE_ENV === 'production';
        res.clearCookie('token', {
            httpOnly: true,
            secure: isProdLogout,
            sameSite: isProdLogout ? 'none' : 'lax',
            maxAge: 0,
        })
        res.status(200).json({
            success: true,
            message: 'User logged out successfully.'
        });
    }catch (error) {
        return errorResponse(res, 500, error.message);
    }
}

const userProfile = async (req, res) => {
    try {
        const { id } = req.user || {};
        const user = await User.findById(id).select('-password');
        if (!user) {
            return errorResponse(res, 404, 'User not found');
        }
        return res.status(200).json({
            success: true,
            message: 'User profile fetched',
            user,
        });
    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
};

const userProfileUpload = async (req, res) => {
    try {
        const { id } = req.user || {};

        if (!req.file) {
            return errorResponse(res, 400, 'Profile image required');
        }

        const user = await User.findById(id);
        if (!user) {
            return errorResponse(res, 404, 'User not found');
        }

        // Ensure profile object exists
        user.profile = user.profile || {};

        // Decide storage method based on Cloudinary env presence
        const useCloudinary = Boolean(
            process.env.CLOUDINARY_CLOUD_NAME &&
            process.env.CLOUDINARY_CLOUD_API_KEY &&
            process.env.CLOUDINARY_CLOUD_API_SECRET
        );

        // Remove previous image only if using Cloudinary and a public_id exists
        if (useCloudinary && user.profile.public_id) {
            await cloudinary.uploader.destroy(user.profile.public_id, {
                resource_type: 'image',
                folder: 'images',
            });
        }

        if (useCloudinary) {
            const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
            const result = await cloudinary.uploader.upload(fileBase64, {
                folder: 'image',
                resource_type: 'image',
            });
            user.profile.url = result.secure_url;
            user.profile.public_id = result.public_id;
        } else {
            // Local fallback: save to backend/uploads and serve via /uploads
            const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
            fs.mkdirSync(uploadsDir, { recursive: true });

            const orig = req.file.originalname || 'upload';
            const extFromName = orig.includes('.') ? orig.split('.').pop() : '';
            const extFromMime = (req.file.mimetype && req.file.mimetype.split('/')[1]) || '';
            const ext = (extFromName || extFromMime || 'jpg').toLowerCase();
            const filename = `profile-${id}-${Date.now()}.${ext}`;
            const filepath = path.join(uploadsDir, filename);
            fs.writeFileSync(filepath, req.file.buffer);

            const baseUrl = `${req.protocol}://${req.get('host')}`;
            user.profile.url = `${baseUrl}/uploads/${filename}`;
            user.profile.public_id = null;
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Profile uploaded successfully',
            profileUrl: user.profile.url,
        });
    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
};

module.exports = {
    userRegister,
    userLogin,
    userLogout,
    userProfile,
    userProfileUpload,
};