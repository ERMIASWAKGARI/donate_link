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
  const subject = 'Complete Your Registration - Online Donation Platform';

  const html = `
    <div style="font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; max-width: 600px; margin: auto; padding: 0; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.05);">
      <!-- Header with brand color -->
      <div style="background-color: #008080; padding: 25px; text-align: center;">
        <h1 style="margin: 0; color: white; font-size: 26px; font-weight: 600;">Online Donation Platform</h1>
        <p style="margin: 5px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Empowering Generosity Worldwide</p>
      </div>
      
      <!-- Hero section -->
      <div style="background-color: #f8f9fa; padding: 30px 20px; text-align: center; border-bottom: 1px solid #e0e0e0;">
        <div style="background-color: #FFEB3B; width: 80px; height: 80px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px;">
          <span style="font-size: 36px;">✋</span>
        </div>
        <h2 style="color: #2d3748; margin: 15px 0 10px; font-size: 22px; font-weight: 600;">Welcome to Our Community!</h2>
        <p style="color: #4a5568; margin: 0 auto; font-size: 15px; line-height: 1.5; max-width: 80%;">
          We're thrilled to have you join our mission to make a difference. Just one more step to complete your registration.
        </p>
      </div>
      
      <!-- Main content -->
      <div style="padding: 30px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 25px;">
          <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
            Please verify your email address to activate your account and start making an impact.
          </p>
          
          <!-- Primary CTA Button -->
          <a href="${verificationUrl}" 
             style="background-color: #008080; color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 500; display: inline-block; transition: all 0.3s ease; margin: 10px 0 25px;">
            Verify My Email Address
          </a>
          
          <p style="color: #718096; font-size: 13px; line-height: 1.5; margin: 0;">
            This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
        
        <!-- Secondary info -->
        <div style="background-color: #f8f9fa; border-radius: 6px; padding: 15px; margin-top: 20px;">
          <p style="color: #4a5568; font-size: 14px; margin: 0; text-align: center;">
            Having trouble with the button? <br>
            <a href="${verificationUrl}" style="color: #008080; text-decoration: none; word-break: break-all;">${verificationUrl}</a>
          </p>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #718096; border-top: 1px solid #e0e0e0;">
        <p style="margin: 0 0 10px;">© ${new Date().getFullYear()} Online Donation Platform. All rights reserved.</p>
        <div style="margin-top: 10px;">
          <a href="#" style="color: #008080; text-decoration: none; margin: 0 10px; font-size: 11px;">Privacy Policy</a>
          <a href="#" style="color: #008080; text-decoration: none; margin: 0 10px; font-size: 11px;">Terms of Service</a>
          <a href="#" style="color: #008080; text-decoration: none; margin: 0 10px; font-size: 11px;">Contact Us</a>
        </div>
      </div>
      
      <!-- Small note -->
      <div style="font-size: 10px; color: #a0aec0; text-align: center; padding: 10px;">
        This is an automated message. Please do not reply directly to this email.
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
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; border: 1px solid #e1e1e1; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <!-- Header -->
      <div style="background-color: #008080; padding: 25px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Online Donation Platform</h1>
        <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9;">Making a difference together</p>
      </div>
      
      <!-- Main Content -->
      <div style="padding: 30px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="background-color: #FFEB3B; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px;">
            <span style="font-size: 28px;">✉️</span>
          </div>
          <h2 style="color: #333333; margin: 0 0 10px; font-size: 22px;">Confirm Your New Email Address</h2>
          <p style="color: #666666; margin: 0; font-size: 15px; line-height: 1.5;">Almost there! Just one more step to update your email.</p>
        </div>
        
        <div style="text-align: center; margin: 25px 0 30px;">
          <a href="${verificationUrl}" 
             style="background-color: #008080; color: white; text-decoration: none; padding: 14px 28px; border-radius: 4px; font-size: 16px; font-weight: 500; display: inline-block; transition: all 0.3s ease;">
            Verify Email Address
          </a>
        </div>
        
        <div style="border-top: 1px solid #eeeeee; padding-top: 20px; text-align: center;">
          <p style="color: #777777; font-size: 13px; line-height: 1.5; margin: 0;">
            If you didn't request this change, please <a href="mailto:support@donationplatform.com" style="color: #008080; text-decoration: none;">contact our support team</a> immediately.
          </p>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #888888;">
        <p style="margin: 0 0 10px;">© ${new Date().getFullYear()} Online Donation Platform. All rights reserved.</p>
        <div style="margin-top: 10px;">
          <a href="#" style="color: #008080; text-decoration: none; margin: 0 10px; font-size: 11px;">Privacy Policy</a>
          <a href="#" style="color: #008080; text-decoration: none; margin: 0 10px; font-size: 11px;">Terms of Service</a>
          <a href="#" style="color: #008080; text-decoration: none; margin: 0 10px; font-size: 11px;">Contact Us</a>
        </div>
      </div>
      
      <!-- Small note for email clients -->
      <div style="font-size: 10px; color: #aaaaaa; text-align: center; padding: 10px;">
        This is an automated message. Please do not reply directly to this email.
      </div>
    </div>
  `;

  await sendEmail(email, subject, html);
};

// Function to send reset password email
const sendResetPasswordEmail = async (email, token) => {
  const resetUrl = `http://localhost:5173/reset-password?token=${token}`;
  const subject = 'Secure Password Reset - Online Donation Platform';

  const html = `
    <div style="font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; max-width: 600px; margin: auto; padding: 0; border: 1px solid #e1e1e1; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
      <!-- Security Header -->
      <div style="background-color: #008080; padding: 25px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Online Donation Platform</h1>
        <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9;">Account Security Notification</p>
      </div>
      
      <!-- Security Alert Section -->
      <div style="background-color: #fff8e1; padding: 15px; text-align: center; border-bottom: 1px solid #ffe0b2;">
        <div style="display: inline-flex; align-items: center; gap: 8px;">
          <div style="background-color: #FFEB3B; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 14px;">!</span>
          </div>
          <span style="color: #5d4037; font-size: 14px; font-weight: 500;">Security-sensitive action required</span>
        </div>
      </div>
      
      <!-- Main Content -->
      <div style="padding: 30px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #d32f2f; font-size: 20px; margin: 0 0 15px;">Password Reset Requested</h2>
          <p style="color: #424242; font-size: 15px; line-height: 1.5; margin: 0 0 20px;">
            We received a request to reset your password. If this was you, please reset your password immediately using the link below.
          </p>
          
          <!-- Primary Action Button -->
          <a href="${resetUrl}" 
             style="background-color: #008080; color: white; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-size: 16px; font-weight: 500; display: inline-block; margin: 15px 0 25px; transition: all 0.3s ease;">
            Reset Password Now
          </a>
          
          <p style="color: #616161; font-size: 13px; line-height: 1.5; margin: 0;">
            <strong>Important:</strong> This link will expire in <strong>15 minutes</strong> for your security.
          </p>
        </div>
        
        <!-- Secondary Content -->
        <div style="background-color: #f5f5f5; border-radius: 6px; padding: 15px; margin-top: 25px;">
          <h3 style="color: #424242; font-size: 14px; margin: 0 0 10px; text-align: center;">Didn't request this?</h3>
          <p style="color: #616161; font-size: 13px; line-height: 1.5; margin: 0; text-align: center;">
            If you didn't request a password reset, please <a href="mailto:security@donationplatform.com" style="color: #008080; text-decoration: none;">contact our security team</a> immediately and change your password.
          </p>
        </div>
        
        <!-- Manual Link -->
        <div style="margin-top: 25px; text-align: center;">
          <p style="color: #757575; font-size: 12px; margin: 0 0 5px;">Or paste this link in your browser:</p>
          <a href="${resetUrl}" style="color: #008080; font-size: 12px; word-break: break-all; text-decoration: none;">${resetUrl}</a>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #757575; border-top: 1px solid #e0e0e0;">
        <p style="margin: 0 0 10px;">© ${new Date().getFullYear()} Online Donation Platform. All rights reserved.</p>
        <div style="margin-top: 10px;">
          <a href="#" style="color: #008080; text-decoration: none; margin: 0 10px; font-size: 11px;">Security</a>
          <a href="#" style="color: #008080; text-decoration: none; margin: 0 10px; font-size: 11px;">Privacy Policy</a>
          <a href="#" style="color: #008080; text-decoration: none; margin: 0 10px; font-size: 11px;">Help Center</a>
        </div>
      </div>
      
      <!-- Security Note -->
      <div style="font-size: 10px; color: #9e9e9e; text-align: center; padding: 10px; background-color: #fafafa;">
        For your security, this email was sent automatically. Please do not reply.
      </div>
    </div>
  `;

  await sendEmail(email, subject, html);
  console.log('Password reset email sent successfully to:', email);
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendEmailUpdateVerification,
};
