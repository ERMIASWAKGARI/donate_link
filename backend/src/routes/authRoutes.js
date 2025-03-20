const express = require('express');

const {
  login,
  verifyEmail,
  verifyOtp,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  resendVerificationEmail,
  resendOTP,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', login);
router.get('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);
router.post('/resend-verification-email', resendVerificationEmail);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', protect, changePassword);
router.post('/verify-otp', verifyOtp);

module.exports = router;
