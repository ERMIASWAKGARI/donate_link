const { client, verifySid } = require('../config/twilio');
const AppError = require('../utils/appError');

const sendOTP = async (phone) => {
  console.log('Sending OTP to:', phone);

  if (!phone) {
    return {
      success: false,
      message: 'Phone number is required.',
      statusCode: 400,
    };
  }

  try {
    const otp = await client.verify.v2
      .services(verifySid)
      .verifications.create({ to: phone, channel: 'sms' });

    return { success: true, message: 'OTP sent successfully.' };
  } catch (error) {
    console.error('Error sending OTP:', error.message);
    throw new AppError(
      'Failed to send OTP. Please check the phone number and try again.',
      500
    );
  }
};

module.exports = sendOTP;
