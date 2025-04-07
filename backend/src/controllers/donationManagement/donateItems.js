const MaterialDonation = require('../../models/matterialDonation');
const AppError = require('../../utils/appError');
const asyncWrapper = require('../../middleware/asyncWrapper');

// Create material donation
const createMaterialDonation = asyncWrapper(async (req, res, next) => {
  const donationData = req.body;

  // Validate required fields
  if (!donationData.NGO || !donationData.needId || !donationData.location || !donationData.materials) {
    return next(new AppError('Missing required fields', 400));
  }

  // Create donation
  const donation = await MaterialDonation.create({
    ...donationData,
    donationType: 'material',
    trackingId: Math.random().toString(36).substring(2, 15)
  });

  res.status(201).json({
    status: 'success',
    data: {
      donation
    }
  });
});

// Get material donation by ID
const getMaterialDonation = asyncWrapper(async (req, res, next) => {
  const donation = await MaterialDonation.findById(req.params.id)
    .populate('NGO')
    .populate('needId');

  if (!donation) {
    return next(new AppError('No donation found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      donation
    }
  });
});

// Update material donation if within 20 minutes of creation
const updateMaterialDonation = asyncWrapper(async (req, res, next) => {
  const donation = await MaterialDonation.findById(req.params.id);

  if (!donation) {
    return next(new AppError('No donation found with that ID', 404));
  }

  // Check if donation was created less than 20 minutes ago
  const timeSinceCreation = (Date.now() - donation.createdAt) / (1000 * 60); // Convert to minutes
  if (timeSinceCreation > 20) {
    return next(new AppError('Donations can only be updated within 20 minutes of creation', 400));
  }

  // Update allowed fields
  const updatedDonation = await MaterialDonation.findByIdAndUpdate(
    req.params.id,
    {
      pictures: req.body.pictures,
      location: req.body.location,
      materials: req.body.materials
    },
    {
      new: true,
      runValidators: true
    }
  );
  // Validate materials array
  if (!updatedDonation.materials || updatedDonation.materials.length === 0) {
    return next(new AppError('At least one material item is required', 400));
  }

  // Validate location
  if (!updatedDonation.location || 
      !updatedDonation.location.latitude ||
      !updatedDonation.location.longitude ||
      !updatedDonation.location.address) {
    return next(new AppError('Location with latitude, longitude and address is required', 400));
  }

  // Validate pictures array length
  if (updatedDonation.pictures && updatedDonation.pictures.length > 10) {
    return next(new AppError('Cannot upload more than 10 pictures', 400));
  }

  // Validate materials array items
  for (const material of updatedDonation.materials) {
    if (!material.categoryName || material.categoryName.length > 50) {
      return next(new AppError('Category name is required and cannot exceed 50 characters', 400));
    }
    if (!material.subCategoryName || material.subCategoryName.length > 50) {
      return next(new AppError('Sub-category name is required and cannot exceed 50 characters', 400)); 
    }
    if (!material.quantity || material.quantity < 1) {
      return next(new AppError('Quantity must be at least 1', 400));
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      donation: updatedDonation
    }
  });
});
module.exports={updateMaterialDonation,createMaterialDonation,getMaterialDonation}