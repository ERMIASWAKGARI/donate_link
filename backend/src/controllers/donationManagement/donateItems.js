const MaterialDonation = require('../../models/matterialDonation');
const AppError = require('../../utils/appError');
const asyncWrapper = require('../../middleware/asyncWrapper');
const {sendNotification} = require("../../utils/notificationService");
const Need = require('../../models/needsModel');

// Create material donation
const createMaterialDonation = async (req, res) => {
  try {

    const { NGO, donorId, needId, materials, location, message } = req.body;
    
    // Validate required fields
    if (!NGO || !donorId || !needId || !materials || !location) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Parse materials and location from stringified JSON (if needed)
    const materialsArray = typeof materials === 'string' ? JSON.parse(materials) : materials;
    const locationObj = typeof location === 'string' ? JSON.parse(location) : location;

    // Generate tracking ID
    const trackingId = 'DON-' + Date.now().toString(36).toUpperCase();

    // Get uploaded picture URLs (assuming you've configured cloud storage)
    const pictures = req.files?.map(file => file.path) || [];

    const newDonation = new MaterialDonation({
      NGO,
      donorId,
      needId,
      pictures,
      donationType: 'material',
      trackingId,
      location: {
        latitude: locationObj.latitude,
        longitude: locationObj.longitude,
        address: locationObj.address
      },
      materials: materialsArray,
      message: message || ''
    });

    await newDonation.save();
    // Update the need to indicate it has donations
    const needBeingApplied = await Need.findById(needId);
    if (needBeingApplied) {
      needBeingApplied.hasDonations = true;
      await needBeingApplied.save();
    } else {
      return res.status(404).json({ message: 'Need not found' });
    }
     sendNotification(
       newDonation.NGO,
       `New donation made for your need  by ${req.user.name} with tracking ID ${trackingId}`,
       "report",
       `/ngo/dasboard/#donationList`
     );
    res.status(201).json({
      message: 'Material donation submitted successfully',
      donation: newDonation
    });
  } catch (error) {
    console.error('Error submitting material donation:', error);
    res.status(500).json({ message: 'Failed to submit donation', error: error.message });
  }
};
// Get material donation by ID
const getMaterialDonation = asyncWrapper(async (req, res, next) => {
  console.log("here the request is",req.params.ngoId,req.params.needId);
  const donations = await MaterialDonation.find({ NGO: req.params.ngoId, needId: req.params.needId })
    .populate('NGO')
    .populate('needId')
    .populate('donorId');

 

  res.status(200).json({
    status: 'success',
    results: donations.length,
    data: {
      donations
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
// Endpoint to update the status of the donation made to NGO
const updateDonationStatus = asyncWrapper(async (req, res, next) => {
  const { status } = req.body;
  const {id}=req.params;

  // Validate status
  const validStatuses = ['pending',  'completed'];
  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid status value', 400));
  }

  const donation = await MaterialDonation.findById(id);

  if (!donation) {
    return next(new AppError('No donation found with that ID', 404));
  }

  donation.status = status;
  await donation.save();

  res.status(200).json({
    status: 'success',
    data: {
      donation
    }
  });
});

module.exports = {
  updateMaterialDonation,
  createMaterialDonation,
  getMaterialDonation,
  updateDonationStatus
};