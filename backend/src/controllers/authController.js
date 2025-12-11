const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const User = require('../models/User');
const initializeFirebase = require('../config/firebase');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const Logger = require('../utils/logger');

// Ensure Firebase Admin is initialized
if (!admin.apps.length) {
  try {
    initializeFirebase();
  } catch (e) {
    Logger.error('Failed to initialize Firebase Admin in authController', e);
  }
}

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Register/Login with Firebase token
 * Frontend sends Firebase ID token, backend verifies it and returns JWT
 * @route POST /api/auth/firebase
 * @access Public
 */
const authenticateWithFirebase = asyncHandler(async (req, res, next) => {
  const { firebaseToken } = req.body;

  if (!firebaseToken) {
    throw new AppError('Firebase token is required', 400, 'MISSING_TOKEN');
  }

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    const { uid, email, name, picture } = decodedToken;

    // Get full user record from Firebase to get displayName
    const firebaseUser = await admin.auth().getUser(uid);
    const displayName = firebaseUser.displayName || name || 'Anonymous User';

    // Check if user exists by firebaseUid
    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // Check if email already exists (user registered with email/password)
      const existingUser = await User.findOne({ email: email });

      if (existingUser) {
        // Link Firebase UID to existing user
        existingUser.firebaseUid = uid;
        if (!existingUser.displayName || existingUser.displayName === 'Anonymous User') {
          existingUser.displayName = displayName;
        }
        if (!existingUser.photoURL && picture) {
          existingUser.photoURL = picture;
        }
        await existingUser.save();
        user = existingUser;
      } else {
        // Create new user
        user = new User({
          firebaseUid: uid,
          email: email || `${uid}@firebase.user`,
          displayName: displayName,
          photoURL: picture || firebaseUser.photoURL || null
        });
        await user.save();
      }
    } else {
      // Update displayName if it was Anonymous User
      if ((!user.displayName || user.displayName === 'Anonymous User') && displayName !== 'Anonymous User') {
        user.displayName = displayName;
        await user.save();
      }
    }

  // Generate JWT token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Authentication successful',
    token,
    user: {
      id: user._id,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      subscription: user.subscription
    }
  });
});

/**
 * Get current user info
 * @route GET /api/auth/me
 * @access Private
 */
const getCurrentUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.userId).select('-__v');

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      subscription: user.subscription,
      createdAt: user.createdAt
    }
  });
});

/**
 * Refresh JWT token
 * @route POST /api/auth/refresh
 * @access Private
 */
const refreshToken = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.userId);

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    token
  });
});

module.exports = {
  authenticateWithFirebase,
  getCurrentUser,
  refreshToken
};
