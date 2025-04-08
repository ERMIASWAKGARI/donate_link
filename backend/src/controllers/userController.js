const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const asyncWrapper = require('../middleware/asyncWrapper');
const AppError = require('../utils/appError');
const sendSuccessResponse = require('../utils/responseHelper');
const sendOTP = require('../utils/sendOTP');
const APIFeatures = require('../utils/apiFeatures');
const { sendNotification } = require('../utils/notificationService');
const JWT_SECRET = process.env.JWT_SECRET;

const {
  sendVerificationEmail,
  sendEmailUpdateVerification,
} = require('../utils/emailService');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    },
    JWT_SECRET,
    { expiresIn: '3h' } // Access token expires in 3 hour
  );
};

// Register User
const registerUser = asyncWrapper(async (req, res) => {
  const { role, name, email, phone, password, googleId } = req.body;

  console.log(req.body);

  // Check if the email or phone is already registered
  if (email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      throw new AppError('User with this email already exists', 400);
    }
  }

  if (phone) {
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      throw new AppError('User with this phone number already exists', 400);
    }
  }

  let hashedPassword = undefined;

  if (googleId) {
    hashedPassword = 'GoogleAuthUser';
  } else {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  let userData = {
    role,
    name,
    phone,
    email,
    password: hashedPassword,
    googleId: googleId || undefined,
  };

  // Assign role-specific fields
  switch (role) {
    case 'individual_donor':
      userData = { ...userData, donorType: 'individual' };
      break;

    case 'organization_donor':
      userData = {
        ...userData,
        donorType: 'organization',
        isVerified: false,
      };
      break;

    case 'volunteer':
      userData = {
        ...userData,
        isVerified: false,
      };
      break;

    case 'ngo':
      userData = {
        ...userData,
        isVerified: false,
      };
      break;

    default:
      throw new AppError('Invalid user role provided.', 400);
  }

  // Handle Email Verification (if email is provided)
  if (email) {
    if (googleId) {
      userData.isEmailVerified = true;
    } else {
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');
      userData.isEmailVerified = false;
      userData.emailVerificationToken = emailVerificationToken;
    }
  }

  // Handle Phone Verification
  if (phone && !email) {
    userData.isPhoneVerified = false;
    console.log(phone);

    sendOTP(phone); // ✅ Reuse sendOTP function
  }

  console.log(userData);
  // Create & Save User
  const newUser = new User(userData);
  console.log(newUser);
  await newUser.save();

  // Send email verification if email exists
  if (email && !googleId) {
    await sendVerificationEmail(email, userData.emailVerificationToken);
  }

  const accessToken = googleId ? generateToken(newUser) : undefined;

  sendSuccessResponse(
    res,
    201,
    `${
      googleId
        ? 'Registration successful.'
        : `Registration successful. Please verify your ${
            email ? 'email' : 'phone number'
          }.`
    }`,
    {
      id: newUser._id,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      name: newUser.name,
      requiresVerification: !googleId, // If Google, no verification needed
      verificationType: email ? 'email' : phone ? 'phone' : null, // ✅ Specify verification type
      ...(googleId && { accessToken }), // ✅ Only include accessToken if Google user
    }
  );
});
const uploadProfilePicture = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (!req.file) {
    throw new AppError('No file uploaded.', 400);
  }

  // Store the profile picture filename in the user model
  user.profilePicture = req.file.filename;
  await user.save();

  sendSuccessResponse(res, 200, 'Profile picture updated successfully!', {
    profilePicture: req.file.filename,
  });
});

const uploadVerificationDocs = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    '+ngoVerificationDocs +organizationVerificationDocs +volunteerVerificationDocs'
  );

  if (!user) throw new AppError('User not found.', 404);
  if (user.isVerified) {
    throw new AppError('User is already verified.', 400);
  }

  if (!req.files || Object.keys(req.files).length === 0)
    throw new AppError('No files uploaded.', 400);

  // Document requirements mapping
  const DOCUMENT_REQUIREMENTS = {
    ngo: {
      required: ['registrationCertificate', 'authorizationLetter'],
      field: 'ngoVerificationDocs',
    },
    organization_donor: {
      required: ['licenseCertificate', 'taxCertificate'],
      field: 'organizationVerificationDocs',
    },
    volunteer: {
      required: ['idCard', 'trainingCertificate'],
      field: 'volunteerVerificationDocs',
    },
  };

  const config = DOCUMENT_REQUIREMENTS[user.role];
  if (!config)
    throw new AppError('This role does not require verification docs.', 400);

  // Initialize documents object if missing
  if (!user[config.field]) {
    user[config.field] = {};
  }

  // Validate required documents
  const missingDocs = config.required.filter(
    (doc) => !req.files[doc] && !user[config.field][doc]
  );
  if (missingDocs.length > 0) {
    throw new AppError(
      `Missing required documents: ${missingDocs.join(', ')}`,
      400
    );
  }

  // Process uploaded files
  const processedDocs = {
    ...user[config.field],
    additionalDocs: req.files.additionalDocs
      ? req.files.additionalDocs.map((file) => file.filename)
      : user[config.field].additionalDocs || [],
  };

  // Add required documents
  config.required.forEach((doc) => {
    processedDocs[doc] =
      req.files[doc]?.[0]?.filename || user[config.field][doc];
  });

  // Update user document
  user[config.field] = processedDocs;
  await user.save();

  // Notify admins
  const admins = await User.find({ role: 'admin' });
  admins.forEach((admin) => {
    sendNotification(
      admin._id,
      `New verification documents uploaded by ${user.name}`,
      'verification_docs'
    );
  });

  sendSuccessResponse(res, 200, 'Documents uploaded successfully!', {
    uploadedFiles: processedDocs,
    requiredDocuments: config.required,
  });
});

const getUserProfile = asyncWrapper(async (req, res) => {
  const features = new APIFeatures(User.findById(req.user._id), req.query)
    .filter()
    .search()
    .sort()
    .limit()
    .paginate();

  const user = await features.executeQuery();

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // console.log(user);

  sendSuccessResponse(res, 200, 'User profile retrieved successfully.', user);
});

const updateUserProfile = asyncWrapper(async (req, res) => {
  const { email, phone, ...updates } = req.body;

  const user = await User.findById(req.user._id).select(
    '-password -emailVerificationToken -tokenVersion -isActive -isEmailVerified -lastLogin -__v'
  );

  if (!user) throw new AppError('User not found', 404);

  let isUpdated = false;
  let emailUpdated = false;
  let phoneUpdated = false;

  if (email && email === user.email) {
    throw new AppError('Email is already in use.', 400);
  }

  if (phone && phone === user.phone) {
    throw new AppError('Phone is already in use.', 400);
  }

  // 🔹 Handle Email Update
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new AppError('Email is already in use.', 400);

    user.newEmail = email; // Store as newEmail (not replacing old email)
    user.isNewEmailVerified = false;
    // Generate and send email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = emailVerificationToken;
    await sendEmailUpdateVerification(user.newEmail, emailVerificationToken);

    emailUpdated = true;
  }

  // 🔹 Handle Phone Update
  if (phone && phone !== user.phone) {
    const existingUser = await User.findOne({ phone });
    if (existingUser)
      throw new AppError('Phone number is already in use.', 400);

    user.newPhone = phone; // Store as newPhone (not replacing old phone)
    user.isNewPhoneVerified = false;

    // Send OTP for phone verification
    await sendOTP(user.newPhone);

    phoneUpdated = true;
  }

  // 🔹 Allowed Fields for Each Role
  const allowedFields = {
    individual_donor: ['name', 'address', 'location'],
    organization_donor: [
      'name',
      'organizationVerificationDocs',
      'address',
      'location',
    ],
    ngo: ['name', 'ngoVerificationDocs', 'address', 'location'],
    volunteer: [
      'name',
      'skills',
      'availability',
      'volunteerVerificationDocs',
      'address',
      'location',
    ],
  };

  // 🔹 Update Only Allowed Fields
  Object.keys(updates).forEach((key) => {
    if (allowedFields[user.role] && allowedFields[user.role].includes(key)) {
      user[key] = updates[key];
      isUpdated = true;
    }
  });

  if (!isUpdated && !emailUpdated && !phoneUpdated) {
    throw new AppError('No valid fields to update or not allowed.', 400);
  }

  await user.save();

  if (emailUpdated) {
    return sendSuccessResponse(
      res,
      200,
      'Please verify your new email before it is updated.'
    );
  } else if (phoneUpdated) {
    return sendSuccessResponse(
      res,
      200,
      'Please verify your new phone before it is updated.'
    );
  }

  sendSuccessResponse(res, 200, 'Profile updated successfully.', user);
});

const deactivateAccount = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new AppError('User not found', 404);

  // Prevent already deactivated users from deactivating again
  if (!user.isActive)
    throw new AppError('Account is already deactivated.', 400);

  // Set isActive to false
  user.isActive = false;
  user.tokenVersion += 1; // Invalidate old tokens (ti force logout)
  await user.save();

  sendSuccessResponse(res, 200, 'Your account has been deactivated.');
});

const reactivateAccount = asyncWrapper(async (req, res) => {
  const { reactivationToken } = req.body;

  // Verify the token
  const decoded = jwt.verify(reactivationToken, process.env.JWT_SECRET);
  if (decoded.type !== 'reactivation') {
    throw new AppError('Invalid reactivation token.', 400);
  }

  const user = await User.findById(decoded.userId);
  if (!user) throw new AppError('User not found.', 404);

  if (user.isActive) {
    return sendSuccessResponse(res, 200, 'Your account is already active.');
  }

  // Reactivate the account
  user.isActive = true;
  await user.save();

  sendSuccessResponse(
    res,
    200,
    'Your account has been reactivated. You can now log in.'
  );
});

const recoverAccount = asyncWrapper(async (req, res) => {
  const { accountRecoveryToken } = req.body;

  if (!accountRecoveryToken) {
    throw new AppError('Recovery token is required.', 400);
  }
  // Verify the token
  const decoded = jwt.verify(accountRecoveryToken, process.env.JWT_SECRET);
  if (decoded.type !== 'recovery') {
    throw new AppError('Invalid recovery token.', 400);
  }

  const user = await User.findById(decoded.userId);
  if (!user) throw new AppError('User not found.', 404);

  if (!user.isDeleted) {
    return sendSuccessResponse(
      res,
      200,
      'Your account is already working(NOT DELETED!).'
    );
  }

  // Reactivate the account
  user.isDeleted = false;
  user.deletedAt = null;
  await user.save();

  sendSuccessResponse(
    res,
    200,
    'Your account has been recovered. You can now log in.'
  );
});

const deleteUserAccount = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  // Check if the user is active (only active users can delete their accounts)
  if (!user.isActive) {
    throw new AppError(
      'Your account is deactivated, you cannot delete it.',
      400
    );
  }

  // Delete user permanently
  await User.findByIdAndDelete(req.user._id);

  sendSuccessResponse(res, 200, 'Your account has been permanently deleted.');
});

const softDeleteUserAccount = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (user.isDeleted) {
    throw new AppError('User is already deleted.', 400);
  }

  // 🔹 Prevent deletion if account is deactivated
  if (!user.isActive) {
    throw new AppError(
      'Your account is deactivated. You cannot delete it.',
      400
    );
  }

  // 🔹 Soft delete: Mark user as deleted instead of removing
  user.isDeleted = true;
  user.deletedAt = new Date();
  await user.save();

  sendSuccessResponse(res, 200, 'Your account has been deleted (soft delete).');
});

module.exports = {
  registerUser,
  getUserProfile,
  updateUserProfile,
  deactivateAccount,
  reactivateAccount,
  softDeleteUserAccount,
  recoverAccount,
  deleteUserAccount,
  uploadVerificationDocs,
  uploadProfilePicture,
};
