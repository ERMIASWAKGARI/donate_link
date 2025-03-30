const nodemailer = require('nodemailer');

// Function to send an email
const sendEmail = async (email, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: '"Online Donation Platform Support" <support@onlinedonationplatform.com>',
      to: email,
      subject: subject,
      html: html, // Use HTML content instead of plain text
    });
    console.log('Email sent successfully to: ', email);
  } catch (error) {
    console.log(email);
    console.error('Error sending email: ', error);
    throw new Error('Error sending email');
  }
};

// Function to send verification email for registration
const sendVerificationEmail = async (email, verificationToken) => {
  const verificationUrl = `http://localhost:5173/verify-email?token=${verificationToken}`;
  const subject = 'Confirm Your Email - Online Donation Platform';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #f9f9f9;">
      <div style="background-color: #4CAF50; padding: 15px; text-align: center; color: white; font-size: 22px; font-weight: bold; border-top-left-radius: 8px; border-top-right-radius: 8px;">
        Online Donation Platform
      </div>
      <div style="padding: 20px; text-align: center;">
        <h2 style="color: #333;">Welcome to Our Community! 🌍</h2>
        <p style="font-size: 16px; color: #555;">Thank you for joining <strong>Online Donation Platform</strong>. Before you start making a difference, please verify your email address by clicking the button below:</p>
        <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-size: 16px; display: inline-block; margin: 20px 0;">Verify Email</a>
        <p style="font-size: 14px; color: #777;">If you didn't sign up, you can safely ignore this email.</p>
      </div>
      <div style="background-color: #eee; text-align: center; padding: 10px; font-size: 12px; color: #666; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
        &copy; ${new Date().getFullYear()} Online Donation Platform. All rights reserved.
      </div>
    </div>
  `;

  await sendEmail(email, subject, html);
};

// Function to send verification email after email update
const sendEmailUpdateVerification = async (email, verificationToken) => {
  const verificationUrl = `http://localhost:5173/verify-email?token=${verificationToken}`;
  const subject = 'Verify Your New Email - Online Donation Platform';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #f9f9f9;">
      <div style="background-color: #4CAF50; padding: 15px; text-align: center; color: white; font-size: 22px; font-weight: bold; border-top-left-radius: 8px; border-top-right-radius: 8px;">
        Online Donation Platform
      </div>
      <div style="padding: 20px; text-align: center;">
        <h2 style="color: #333;">Confirm Your New Email Address 📩</h2>
        <p style="font-size: 16px; color: #555;">You recently updated your email address on <strong>Online Donation Platform</strong>. Please verify your new email by clicking the button below:</p>
        <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-size: 16px; display: inline-block; margin: 20px 0;">Verify New Email</a>
        <p style="font-size: 14px; color: #777;">If you didn't update your email, please contact our support team immediately.</p>
      </div>
      <div style="background-color: #eee; text-align: center; padding: 10px; font-size: 12px; color: #666; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
        &copy; ${new Date().getFullYear()} Online Donation Platform. All rights reserved.
      </div>
    </div>
  `;

  await sendEmail(email, subject, html);
};

// Function to send reset password email
const sendResetPasswordEmail = async (email, token) => {
  const resetUrl = `http://localhost:5173/reset-password?token=${token}`;
  const subject = 'Password Reset Request - Online Donation Platform';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #f9f9f9;">
      <div style="background-color:  #4CAF50; padding: 15px; text-align: center; color: white; font-size: 22px; font-weight: bold; border-top-left-radius: 8px; border-top-right-radius: 8px;">
        Online Donation Platform
      </div>
      <div style="padding: 20px; text-align: center;">
        <h2 style="color: #333;">Reset Your Password 🔑</h2>
        <p style="font-size: 16px; color: #555;">
          We received a request to reset your password. Click the button below to proceed:
        </p>
        <a href="${resetUrl}" style="background-color:  #4CAF50; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-size: 16px; display: inline-block; margin: 20px 0;">
          Reset Password
        </a>
        <p style="font-size: 14px; color: #777;">
          If you did not request this, you can safely ignore this email. This link will expire in 15 minutes.
        </p>
      </div>
      <div style="background-color: #eee; text-align: center; padding: 10px; font-size: 12px; color: #666; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
        &copy; ${new Date().getFullYear()} Online Donation Platform. All rights reserved.
      </div>
    </div>
  `;

  await sendEmail(email, subject, html);

  console.log('Password reset email sent successfully to:', email);
};

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendEmailUpdateVerification,
};
