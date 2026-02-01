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

    // ✅ SAFE SECRET FALLBACK
    const secret =
      process.env.JWT_SECRET || "render_production_fallback_secret";

    const token = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin || false,
      },
      secret,
      { expiresIn: "7d" }
    );

    // ✅ CROSS DOMAIN COOKIE FIX (VERCEL + RENDER)
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
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
      return errorResponse(res, 400, "Profile image required");
    }

    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    user.profile = user.profile || {};

    const useCloudinary = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_CLOUD_API_KEY &&
        process.env.CLOUDINARY_CLOUD_API_SECRET
    );

    // Delete old cloudinary image
    if (useCloudinary && user.profile.public_id) {
      await cloudinary.uploader.destroy(user.profile.public_id);
    }

    // ===== CLOUDINARY (PRODUCTION) =====

    if (useCloudinary) {
      const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
        "base64"
      )}`;

      const result = await cloudinary.uploader.upload(fileBase64, {
        folder: "profiles",
      });

      user.profile.url = result.secure_url; // HTTPS ✔
      user.profile.public_id = result.public_id;
    }

    // ===== LOCAL FALLBACK (DEV ONLY) =====

    else {
      const uploadsDir = path.join(__dirname, "..", "..", "uploads");
      fs.mkdirSync(uploadsDir, { recursive: true });

      const filename = `profile-${id}-${Date.now()}.jpg`;
      const filepath = path.join(uploadsDir, filename);

      fs.writeFileSync(filepath, req.file.buffer);

      user.profile.url = `/uploads/${filename}`;
      user.profile.public_id = null;
    }

    await user.save();

    return res.status(200).json({
      success: true,
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
