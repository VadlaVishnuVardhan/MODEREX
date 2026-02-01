const User = require("../models/user.model");
const { errorResponse } = require("../utils/utils");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

// ================= REGISTER =================

const userRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return errorResponse(res, 400, "Please provide all required fields.");
    }

    const user = await User.findOne({ email });
    if (user) {
      return errorResponse(res, 400, "User already exists with this email.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
    });

  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ================= LOGIN =================

const userLogin = async (req, res) => {
  try {

    const { email, password } = req.body || {};

    if (!email || !password) {
      return errorResponse(res, 400, "Please provide Email and Password");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 404, "No user found with this email.");
    }

    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      return errorResponse(res, 401, "Invalid Password.");
    }

    // ✅ PRODUCTION SAFE JWT
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET missing in environment variables");
    }

    const token = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin || false,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ CROSS DOMAIN COOKIE FIX
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,      // HTTPS only
      sameSite: "none",  // Cross domain cookie
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "User logged in successfully.",
    });

  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ================= LOGOUT =================

const userLogout = async (req, res) => {
  try {

    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(200).json({
      success: true,
      message: "User logged out successfully.",
    });

  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ================= PROFILE =================

const userProfile = async (req, res) => {
  try {

    const { id } = req.user;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    return res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ================= PROFILE UPLOAD =================

const userProfileUpload = async (req, res) => {
  try {

    const { id } = req.user;

    if (!req.file) {
      return errorResponse(res, 400, 'Profile image required');
    }

    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    // 🔥 FORCE CLOUDINARY IN PRODUCTION
    const isProd = process.env.NODE_ENV === "production";

    if (!isProd) {
      return errorResponse(res, 500, "Local uploads disabled in production");
    }

    // Delete old cloudinary image
    if (user.profile?.public_id) {
      await cloudinary.uploader.destroy(user.profile.public_id);
    }

    // Upload to cloudinary
    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(fileBase64, {
      folder: "profiles"
    });

    user.profile = {
      url: result.secure_url,     // ✅ HTTPS URL
      public_id: result.public_id
    };

    await user.save();

    return res.status(200).json({
      success: true,
      profileUrl: result.secure_url
    });

  } catch (error) {
    console.error(error);
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
