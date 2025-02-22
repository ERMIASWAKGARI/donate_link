const { client, verifySid } = require("../config/twilio");
const AppError = require("../utils/appError");

const sendOTP = async (phone) => {
  try {
    if (!phone) {
      throw new AppError("Phone number is required.", 400);
    }

    await client.verify.v2
      .services(verifySid)
      .verifications.create({ to: phone, channel: "sms" });

    return { success: true, message: "OTP sent successfully." };
  } catch (error) {
    console.error("Error sending OTP:", error.message);
    throw new AppError("Failed to send OTP. Please try again.", 500);
  }
};

module.exports = sendOTP;
