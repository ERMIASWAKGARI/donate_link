const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const { OAuth2Client } = require('google-auth-library');

const clientI = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // 🔹 Correct Initialization

const User = require('../models/User');
const asyncWrapper = require('../middleware/asyncWrapper');
const sendSuccessResponse = require('../utils/responseHelper');
const AppError = require('../utils/appError');
const sendOTP = require('../utils/sendOTP');
const { sendResetPasswordEmail } = require('../utils/emailService');
const { sendVerificationEmail } = require('../utils/emailService');
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const { client, verifySid } = require('../config/twilio');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    },
    JWT_SECRET,
    { expiresIn: '3h' }
  );
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

const verifyEmail = asyncWrapper(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    throw new AppError('Invalid or missing token.', 400);
  }

  // Find user with matching email verification token
  const user = await User.findOne({ emailVerificationToken: token });

  if (!user) {
    throw new AppError('Invalid or expired token.', 400);
  }

  // 🔹 If verifying new account
  if (!user.isEmailVerified && !user.newEmail) {
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();
    return sendSuccessResponse(
      res,
      200,
      'Email verified successfully. Your account is now active.'
    );
  }

  // 🔹 If verifying updated email
  if (user.newEmail) {
    user.email = user.newEmail;
    user.newEmail = undefined;
    user.isEmailVerified = true;
    user.isNewEmailVerified = undefined;

    user.emailVerificationToken = undefined;
    await user.save();
    return sendSuccessResponse(res, 200, 'Email verified successfully.');
  }

  throw new AppError('No email verification required.', 400);
});

const verifyOtp = asyncWrapper(async (req, res) => {
  const { phone, otp } = req.body;

  // Find user with matching phone or newPhone
  const user = await User.findOne({ $or: [{ phone }, { newPhone: phone }] });

  if (!user) {
    throw new AppError('User not found or invalid phone number.', 400);
  }

  // Check if phone is already verified
  if (user.phone === phone && user.isPhoneVerified) {
    throw new AppError('Phone is already verified.', 400);
  }

  // Verify OTP via Twilio
  const verification_check = await client.verify.v2
    .services(verifySid)
    .verificationChecks.create({ to: phone, code: otp });

  if (verification_check.status !== 'approved') {
    throw new AppError('Invalid OTP!', 400);
  }

  // 🔹 If verifying new account
  if (!user.isPhoneVerified && !user.newPhone) {
    user.isPhoneVerified = true;
    await user.save();
    return sendSuccessResponse(
      res,
      200,
      'Phone verified successfully. Your account is now active.'
    );
  }

  // 🔹 If verifying updated phone
  if (user.newPhone) {
    user.isNewPhoneVerified = true;

    user.phone = user.newPhone;
    user.newPhone = undefined;
    user.isPhoneVerified = true;
    user.isNewEmailVerified = undefined;
    user.isNewPhoneVerified = undefined;

    await user.save();
    return sendSuccessResponse(res, 200, 'Phone verified successfully.');
  }

  throw new AppError('No phone verification required.', 400);
});

const resendVerificationEmail = asyncWrapper(async (req, res) => {
  const { email } = req.body;

  console.log(req.body);
  // Check if the user exists
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError('User not found. Register first.', 404);
  }

  // Check if the user is already verified
  if (user.isEmailVerified) {
    throw new AppError('Email is already verified', 400);
  }

  // Generate a new verification token
  const newVerificationToken = crypto.randomBytes(32).toString('hex');
  // Update the user's verification token
  user.emailVerificationToken = newVerificationToken;
  await user.save();

  // Resend verification email
  await sendVerificationEmail(email, newVerificationToken);

  sendSuccessResponse(res, 200, 'Verification email resent successfully.');
});

const resendOTP = asyncWrapper(async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    throw new AppError('Phone number is required.', 400);
  }

  // Check if the user exists
  const user = await User.findOne({ phone });

  if (!user) {
    throw new AppError('User not found. Register first.', 404);
  }

  // Check if the phone is already verified
  if (user.isPhoneVerified) {
    throw new AppError('Phone number is already verified', 400);
  }

  await sendOTP(phone); // ✅ Reuse sendOTP function

  sendSuccessResponse(res, 200, 'OTP resent successfully.');
});

const login = asyncWrapper(async (req, res) => {
  const { email, phone, password, idToken } = req.body;
  let user = null;

  // console.log(req.body);

  if (idToken) {
    // 🔹 Verify Google ID Token with Google
    const ticket = await clientI.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture, sub } = ticket.getPayload();

    user = await User.findOne({ email });

    if (user) {
      if (user.isBanned) {
        throw new AppError(
          'Your account has been banned. Please contact an admin.',
          403
        );
      }

      console.log(user.isDeleted);
      if (user.isDeleted) {
        const deletionDate = new Date(user.deletedAt);
        const currentDate = new Date();
        const daysSinceDeletion = Math.floor(
          (currentDate - deletionDate) / (1000 * 60 * 60 * 24)
        ); // Convert milliseconds to days

        if (daysSinceDeletion < 30) {
          const accountRecoveryToken = jwt.sign(
            { userId: user._id, type: 'recovery' },
            process.env.JWT_SECRET,
            { expiresIn: '10m' }
          );

          return sendSuccessResponse(
            res,
            200,
            `Your account was deleted on ${
              user.deletedAt
            }. You can recover it within ${30 - daysSinceDeletion} days.`,
            {
              accountRecoveryTokenRequired: true,
              accountRecoveryToken,
            }
          );
        } else {
          throw new AppError(
            'User not found. Account recovery period has expired.',
            400
          );
        }
      }

      const accessToken = generateToken(user);
      return sendSuccessResponse(res, 200, 'Google authentication successful', {
        accessToken,
        user,
      });
    }

    // 🔹 If user does not exist, ask for more info before registration
    return sendSuccessResponse(
      res,
      200,
      'Google authentication needs more info',
      {
        email,
        name,
        picture,
        googleId: sub,
        requiresRegistration: true,
      }
    );
  }

  // 🔹 Handle normal login
  if (email) {
    user = await User.findOne({ email });
    if (!user) {
      throw new AppError('User with this email not found.', 401);
    }
  }

  if (phone) {
    user = await User.findOne({ phone });
    if (!user) {
      throw new AppError('User with this phone not found', 401);
    }
  }

  if (!user) {
    throw new AppError('Invalid login credentials', 401);
  }

  // 🔹 Handle account status (banned, deleted, inactive)
  if (user.isBanned) {
    throw new AppError(
      'Your account has been banned. Please contact an admin.',
      403
    );
  }

  if (user.isDeleted) {
    const deletionDate = new Date(user.deletedAt);
    const currentDate = new Date();
    const daysSinceDeletion = Math.floor(
      (currentDate - deletionDate) / (1000 * 60 * 60 * 24)
    ); // Convert milliseconds to days

    if (daysSinceDeletion < 30) {
      const accountRecoveryToken = jwt.sign(
        { userId: user._id, type: 'recovery' },
        process.env.JWT_SECRET,
        { expiresIn: '10m' }
      );

      return sendSuccessResponse(
        res,
        200,
        `Your account was deleted on ${
          user.deletedAt
        }. You can recover it within ${30 - daysSinceDeletion} days.`,
        {
          accountRecoveryTokenRequired: true,
          accountRecoveryToken,
        }
      );
    } else {
      throw new AppError(
        'User not found. Account recovery period has expired.',
        400
      );
    }
  }

  // 🔹 Ensure the email or phone is verified
  if (email && !user.isEmailVerified) {
    throw new AppError('Please verify your email before logging in.', 403);
  }

  if (phone && !user.isPhoneVerified) {
    throw new AppError('Please verify your phone before logging in.', 403);
  }

  // 🔹 Check password for normal users
  if (!idToken) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid password.', 401);
    }
  }

  // 🔹 If account is deactivated, request reactivation
  if (!user.isActive) {
    const reactivationToken = jwt.sign(
      { userId: user._id, type: 'reactivation' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    return sendSuccessResponse(res, 200, 'Account is deactivated.', {
      reactivationRequired: true,
      reactivationToken,
    });
  }

  // 🔹 Generate JWT and Refresh Token
  const accessToken = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  // Update last login time
  user.lastLogin = new Date();
  await user.save();

  return sendSuccessResponse(res, 200, 'Login successful!', {
    id: user._id,
    email: user.email,
    role: user.role,
    name: user.name,
    accessToken,
    refreshToken,
  });
});

// Refresh Token Function -> refresh access token with refresh token
const refreshToken = asyncWrapper(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new AppError('Refresh token is required.', 401);
  }

  const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new AppError('Invalid refresh token.', 401);
  }

  const newAccessToken = generateToken(user);
  res.status(200).json({ accessToken: newAccessToken });
});

const forgotPassword = asyncWrapper(async (req, res) => {
  const { email, phone } = req.body;

  if (!email && !phone) {
    throw new AppError('Please provide either an email or phone number.', 400);
  }

  let user;
  if (email) {
    user = await User.findOne({ email });
  } else if (phone) {
    user = await User.findOne({ phone });
  }

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (email) {
    // Generate JWT token for email-based password reset
    const resetToken = jwt.sign(
      { id: user._id, version: user.tokenVersion, method: 'email' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Send reset link via email
    await sendResetPasswordEmail(user.email, resetToken);
    sendSuccessResponse(res, 200, 'Password reset link sent to your email.');
  } else if (phone) {
    // Generate OTP for phone-based password reset
    await sendOTP(user.phone);
    sendSuccessResponse(res, 200, 'Password reset OTP sent to your phone.');
  }
});

const resetPassword = asyncWrapper(async (req, res) => {
  const { newPassword, phone, otp } = req.body;
  const { token } = req.query;

  if (!newPassword) {
    throw new AppError('New password is required.', 400);
  }

  let user;
  if (token) {
    // Handle Email-based password reset
    const decoded = jwt.verify(token, JWT_SECRET);

    user = await User.findById(decoded.id);
    if (!user) throw new AppError('User not found.', 404);

    if (decoded.version !== user.tokenVersion) {
      throw new AppError('Invalid or expired token.', 400);
    }
  } else if (phone && otp) {
    // Handle Phone-based password reset using OTP
    user = await User.findOne({ phone });
    if (!user) throw new AppError('User not found.', 404);

    const verification_check = await client.verify.v2
      .services(verifySid)
      .verificationChecks.create({ to: phone, code: otp });

    if (verification_check.status !== 'approved') {
      throw new AppError('Invalid OTP. Please try again.', 400);
    }
  } else {
    throw new AppError(
      'Invalid request. Provide either a token or phone + OTP.',
      400
    );
  }

  // Hash and update new password
  user.password = await bcrypt.hash(newPassword, 10);

  // Invalidate old tokens by incrementing version
  user.tokenVersion += 1;
  await user.save();

  sendSuccessResponse(
    res,
    200,
    'Password reset successful! You can now log in.'
  );
});

const changePassword = asyncWrapper(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Current and new password are required.', 400);
  }

  // Find the authenticated user
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  // Compare current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new AppError('Incorrect current password.', 401);
  }

  // Hash and update new password
  user.password = await bcrypt.hash(newPassword, 10);

  // Invalidate all previous tokens
  user.tokenVersion += 1;
  await user.save();

  sendSuccessResponse(
    res,
    200,
    'Password changed successfully. Please log in again.'
  );
});

module.exports = {
  verifyEmail,
  verifyOtp,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  resendVerificationEmail,
  resendOTP,
};
