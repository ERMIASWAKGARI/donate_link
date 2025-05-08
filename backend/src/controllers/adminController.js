const User = require('../models/User');
const asyncWrapper = require('../middleware/asyncWrapper');
const AppError = require('../utils/appError');
const sendSuccessResponse = require('../utils/responseHelper');
const APIFeatures = require('../utils/apiFeatures');
const { sendNotification } = require('../utils/notificationService');

const Donation = require('../models/donationsModel');
const Need = require('../models/needsModel');

const MaterialDonation = require('../models/matterialDonation');
const Payment = require('../models/paymentModel');

const {
  sendUserVerifiedEmail,
  sendUserVerificationRejectedEmail,
} = require('../utils/emailService');

const getAllPosts = asyncWrapper(async (req, res) => {
  try {
    console.log('Query:', req.query);

    const {
      page = 1,
      limit,
      sortBy = '-createdAt',
      search = '',
      type = '',
    } = req.query;

    const baseMatch = {
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ],
    };

    // Create aggregation pipelines for both collections
    const donationPipeline = [
      { $match: { ...baseMatch } },
      { $addFields: { postType: 'donation' } },

      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          images: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          organization: 1,
          postType: 1,
          needTypes: 1,
          amount: 1,
          category: 1,
        },
      },
    ];

    const needPipeline = [
      { $match: { ...baseMatch } },
      { $addFields: { postType: 'need' } },

      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          images: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          ngo: 1,
          postType: 1,
          needTypes: 1,
          targetAmount: 1,
          category: 1,
        },
      },
    ];

    // Initialize empty arrays
    let donations = [];
    let needs = [];

    // Query based on type
    if (type === 'donation') {
      donations = (await Donation.aggregate(donationPipeline)) || [];
    } else if (type === 'need') {
      needs = (await Need.aggregate(needPipeline)) || [];
    } else {
      // Query both if no type specified
      [donations, needs] = await Promise.all([
        Donation.aggregate(donationPipeline) || [],
        Need.aggregate(needPipeline) || [],
      ]);
    }

    // Combine results (ensure both are arrays)
    const allPosts = [...(donations || []), ...(needs || [])];

    // Apply sorting
    const sortOrder = sortBy.startsWith('-') ? -1 : 1;
    const sortField = sortBy.replace(/^-/, '');

    allPosts.sort((a, b) => {
      if (a[sortField] < b[sortField]) return -1 * sortOrder;
      if (a[sortField] > b[sortField]) return 1 * sortOrder;
      return 0;
    });

    // Handle pagination only if limit is specified
    let responseData;
    if (limit) {
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      responseData = allPosts.slice(startIndex, endIndex);
    } else {
      responseData = allPosts;
    }

    res.json({
      success: true,
      count: allPosts.length,
      pagination: limit
        ? {
            currentPage: Number(page),
            totalPages: Math.ceil(allPosts.length / limit),
            totalItems: allPosts.length,
          }
        : null,
      data: {
        posts: responseData,
      },
    });
  } catch (error) {
    console.error('Error in getAllPosts:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

const deleteDonationPost = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if post exists
    const post = await Donation.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Donation post not found' });
    }

    // Delete the post
    await Donation.findByIdAndDelete(id);

    // Optionally: Delete related images/files from storage

    res.status(200).json({ message: 'Donation post deleted successfully' });
  } catch (error) {
    console.error('Error deleting donation post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteNeedPost = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('id: ', req.params);

    // Check if post exists
    const post = await Need.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Need post not found' });
    }

    // Delete the post
    await Need.findByIdAndDelete(id);

    // Optionally: Delete related images/files from storage

    res.status(200).json({ message: 'Need post deleted successfully' });
  } catch (error) {
    console.error('Error deleting need post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllDonations = asyncWrapper(async (req, res) => {
  const { page = 1, limit, sortBy = '-createdAt', search = '' } = req.query;

  // Build match conditions for search and status
  const baseCondition = {
    $and: [
      search
        ? {
            $or: [
              { 'donor.name': { $regex: search, $options: 'i' } },
              { 'ngo.name': { $regex: search, $options: 'i' } },
              { trackingId: { $regex: search, $options: 'i' } },
              { reference: { $regex: search, $options: 'i' } },
            ],
          }
        : {},
      // Add status filter for completed donations only
      {
        $or: [
          { status: 'Completed' }, // For payments
          { status: 'completed' }, // For material donations
          { status: { $exists: false } }, // For material donations without status
        ],
      },
    ],
  };

  // Fetch material donations with proper population and status filtering
  const materialDonations = await MaterialDonation.find(baseCondition)
    .sort(sortBy)
    .populate('donorId', 'name email')
    .populate('NGO', 'name email')
    .populate('needId', 'title')
    .lean();

  // Fetch monetary donations with proper population and status filtering
  const payments = await Payment.find(baseCondition)
    .sort(sortBy)
    .populate('donorId', 'name email')
    .populate('NGOId', 'name email')
    .populate('needId', 'title')
    .lean();

  // Transform donations into consistent format
  let allDonations = [
    ...materialDonations.map((d) => ({
      _id: d._id,
      donor: d.donorId,
      recipient: d.NGO,
      need: d.needId,
      donationType: 'material',
      type: d.donationType,
      materials: d.materials,
      trackingId: d.trackingId,
      location: d.location,
      pictures: d.pictures,
      status: d.status || 'completed', // Default status for material donations
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    })),
    ...payments.map((p) => ({
      _id: p._id,
      donor: p.donorId,
      recipient: p.NGOId,
      need: p.needId,
      donationType: 'monetary',
      amount: p.amount,
      currency: p.currency,
      description: p.description,
      reference: p.reference,
      tx_ref: p.tx_ref,
      receiptUrl: p.receiptUrl,
      status: p.status.toLowerCase(), // Standardize status casing
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })),
  ];

  // Apply sorting
  const sortOrder = sortBy.startsWith('-') ? -1 : 1;
  const sortField = sortBy.replace(/^-/, '');

  allDonations.sort((a, b) => {
    const aValue =
      a[sortField] instanceof Date ? a[sortField].getTime() : a[sortField];
    const bValue =
      b[sortField] instanceof Date ? b[sortField].getTime() : b[sortField];

    if (aValue < bValue) return -1 * sortOrder;
    if (aValue > bValue) return 1 * sortOrder;
    return 0;
  });

  // Pagination
  let responseData;
  if (limit) {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    responseData = allDonations.slice(startIndex, endIndex);
  } else {
    responseData = allDonations; // Return all if no limit specified
  }

  res.json({
    success: true,
    count: allDonations.length,
    pagination: limit
      ? {
          currentPage: Number(page),
          totalPages: Math.ceil(allDonations.length / limit),
          totalItems: allDonations.length,
        }
      : null,
    data: {
      donations: responseData,
    },
  });
});

// Get all users
const getAllUsers = asyncWrapper(async (req, res) => {
  const { verified, banned, active, all, ...otherQueryParams } = req.query;

  const filter = {};

  // Handle verified filter
  if (verified === 'verified') filter.isVerified = true;
  if (verified === 'unverified') filter.isVerified = false;

  // Handle banned filter
  if (banned === 'banned') filter.isBanned = true;
  if (banned === 'not_banned') filter.isBanned = false;

  // Handle active filter
  if (active === 'active') filter.isActive = true;
  if (active === 'inactive') filter.isActive = false;

  // Count total users matching the filter (not all documents)
  const totalCount = await User.countDocuments(filter);

  const features = new APIFeatures(User.find(filter), otherQueryParams)
    .filter()
    .search()
    .sort();

  // If 'all' parameter is true, skip pagination
  if (req.query.all !== 'true') {
    features.limit().paginate();
  }

  const users = await features.executeQuery();

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const totalPages = Math.ceil(totalCount / limit);

  sendSuccessResponse(res, 200, 'Users retrieved successfully', {
    users,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: totalCount,
      itemsPerPage: limit,
    },
  });
});

// controllers/adminController.js
const getUsersStats = asyncWrapper(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const verifiedUsers = await User.countDocuments({ isVerified: true });
  const bannedUsers = await User.countDocuments({ isBanned: true });
  const pendingVerification = await User.countDocuments({
    isVerified: false,
    isBanned: false,
  });

  sendSuccessResponse(res, 200, 'Users statistics retrieved', {
    totalUsers,
    verifiedUsers,
    bannedUsers,
    pendingVerification,
  });
});

// Get user by ID
const getUserById = asyncWrapper(async (req, res) => {
  // Fetch user without APIFeatures first
  let user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Apply APIFeatures for additional filtering if needed
  const features = new APIFeatures(User.find({ _id: user._id }), req.query)
    .filter()
    .search()
    .sort()
    .limit()
    .paginate();

  user = await features.executeQuery();

  // If query modifications return an empty array, handle it
  if (Array.isArray(user) && user.length === 0) {
    throw new AppError('User not found', 404);
  }

  sendSuccessResponse(res, 200, 'User retrieved successfully', user);
});

// utils/documentUtils.js
const getRequiredDocumentsForRole = (role) => {
  const requirements = {
    ngo: ['registrationCertificate', 'authorizationLetter'],
    organization_donor: ['licenseCertificate', 'taxCertificate'],
    volunteer: ['idCard', 'trainingCertificate'],
  };
  return requirements[role] || [];
};

const getDocumentTypeForRole = (role) => {
  const types = {
    ngo: 'ngoVerificationDocs',
    organization_donor: 'organizationVerificationDocs',
    volunteer: 'volunteerVerificationDocs',
  };
  return types[role];
};

// controllers/documentController.js
const getVerificationDocuments = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.params.id).lean();
  // console.log(user); // Debugging line
  if (!user) throw new AppError('User not found', 404);

  const docType = getDocumentTypeForRole(user.role);
  if (!docType)
    throw new AppError('This user type does not require verification', 400);

  const documents = await User.findById(user._id)
    .select(`+${docType}`)
    .lean()
    .then((u) => u[docType]);

  if (!documents)
    throw new AppError(
      `No verification documents found for this ${user.role}`,
      404
    );

  sendSuccessResponse(
    res,
    200,
    `${user.role} verification documents retrieved`,
    {
      userType: user.role,
      documents,
      requiredDocuments: getRequiredDocumentsForRole(user.role),
    }
  );
});

const verifyUser = asyncWrapper(async (req, res) => {
  const userId = req.params.id;
  const adminId = req.user._id;

  // console.log('User ID:', userId);

  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found.', 404);

  if (user.isVerified) {
    throw new AppError('User is already verified.', 400);
  }

  user.isVerified = true;
  user.verificationStatus = 'verified';
  await user.save();

  sendNotification(
    user._id,
    `Dear ${user.name} your account has been verified.`,
    'verification_status_approved',
    '/profile'
  );

  if (user.email) {
    try {
      await sendUserVerifiedEmail(user.email, user.name);
    } catch (error) {
      console.error('Email sending failed:', error);
    }
  }
  sendSuccessResponse(res, 200, 'User verified successfully.');
});

const rejectUserVerification = asyncWrapper(async (req, res) => {
  const userId = req.params.id;
  const { rejectionReason } = req.body;
  // console.log('Rejection Reason:', rejectionReason);

  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found.', 404);

  // Clear verification documents based on user role
  switch (user.role) {
    case 'organization_donor':
      user.organizationVerificationDocs = {
        licenseCertificate: null,
        taxCertificate: null,
        additionalDocs: [],
      };
      break;
    case 'volunteer':
      user.volunteerVerificationDocs = {
        idCard: null,
        trainingCertificate: null,
        additionalDocs: [],
      };
      break;
    case 'ngo':
      user.ngoVerificationDocs = {
        registrationCertificate: null,
        authorizationLetter: null,
        additionalDocs: [],
      };
      break;
    default:
      break;
  }

  user.isVerified = false;
  user.verificationStatus = 'not_verified';
  await user.save();

  sendNotification(
    user._id,
    `Dear ${user.name}, your account verification was rejected. Reason: ${rejectionReason}`,
    'verification_status_rejected',
    '/profile'
  );

  if (user.email) {
    try {
      await sendUserVerificationRejectedEmail(
        user.email,
        user.name,
        rejectionReason
      );
    } catch (error) {
      console.error('Failed to send verification rejection email:', error);
      // Continue even if email fails
    }
  }

  sendSuccessResponse(
    res,
    200,
    `User verification rejected and documents cleared. Reason: ${rejectionReason}`
  );
});
// Deactivate a user account
const banUser = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.isBanned = true;
  await user.save();

  // await logAdminAction(req.user._id, 'Banned User', user._id); // Log action

  sendSuccessResponse(res, 200, 'User account banned successfully.');
});

const unbanUser = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.isBanned) {
    throw new AppError('User is not banned.', 400);
  }

  user.isBanned = false;
  await user.save();

  sendSuccessResponse(res, 200, 'User account unbanned successfully');
});

const bulkBanUsers = asyncWrapper(async (req, res) => {
  const { userIds } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new AppError('Provide at least one user ID.', 400);
  }

  const result = await User.updateMany(
    { _id: { $in: userIds }, isBanned: false },
    { isBanned: true }
  );

  if (result.modifiedCount === 0) {
    throw new AppError(
      'No users were banned. Check if the IDs are valid and users are not banned.',
      400
    );
  }

  sendSuccessResponse(res, 200, 'Selected users have been banned.');
});

const bulkUnbanUsers = asyncWrapper(async (req, res) => {
  const { userIds } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new AppError('Provide at least one user ID.', 400);
  }

  const result = await User.updateMany(
    { _id: { $in: userIds }, isBanned: true }, // Ensure only banned users are updated
    { isBanned: false }
  );

  if (result.modifiedCount === 0) {
    throw new AppError(
      'No users were unbanned. Check if the IDs are valid and users are banned.',
      400
    );
  }

  sendSuccessResponse(
    res,
    200,
    `${result.modifiedCount} users have been unbanned.`
  );
});

// Delete a user
const deleteUser = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.isDeleted) {
    throw new AppError('You cannot delete this user account.', 400);
  }

  // 🔹 Check if user is already soft-deleted
  if (user.isDeleted) {
    const deletionDate = new Date(user.deletedAt);
    const currentDate = new Date();
    const daysSinceDeletion = Math.floor(
      (currentDate - deletionDate) / (1000 * 60 * 60 * 24)
    ); // Convert milliseconds to days

    if (daysSinceDeletion >= 30) {
      // 🔹 If 30+ days have passed, permanently delete user
      await User.findByIdAndDelete(req.params.id);
      return sendSuccessResponse(
        res,
        200,
        'User permanently deleted after 30+ days.'
      );
    } else {
      // 🔹 If less than 30 days, prevent permanent deletion
      throw new AppError(
        `Cannot delete user yet. ${
          30 - daysSinceDeletion
        } days left until permanent deletion.`,
        400
      );
    }
  }
});

const logAdminAction = async (adminId, action, targetUserId) => {
  await AdminLog.create({
    admin: adminId,
    action,
    targetUser: targetUserId,
    timestamp: new Date(),
  });
};

// controllers/postController.js
const getPostById = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  // console.log('params:', req.params);

  try {
    // First try to find in Donation collection
    let post = await Donation.findById(id)
      .populate('donor', 'name email phone')
      .lean();

    if (post) {
      post.postType = 'donation';
      post.creator = post.donor;

      return res.json({
        success: true,
        data: post,
      });
    }

    // If not found in Donation, try Need collection
    post = await Need.findById(id).populate('NGO', 'name email phone').lean();

    // console.log('post 1: ', post);

    if (post) {
      post.postType = 'need';
      post.creator = post.NGO;
      // console.log('post needs: ', post);

      return res.json({
        success: true,
        data: post,
      });
    }

    return res.status(404).json({
      success: false,
      message: 'Post not found',
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching post',
    });
  }
});

module.exports = {
  getAllUsers,
  getUserById,
  getVerificationDocuments,
  verifyUser,
  rejectUserVerification,
  banUser,
  bulkBanUsers,
  bulkUnbanUsers,
  unbanUser,
  deleteUser,
  getAllPosts,
  getPostById,
  getAllDonations,
  deleteDonationPost,
  deleteNeedPost,
};
