const asyncWrapper = require("../../middleware/asyncWrapper");
const Need = require("../../models/needsModel");
const User = require("../../models/User");
const Notification = require("../../models/notificationModel");
const { getIO, onlineUsers } = require("../../utils/socketConfig");
const mongoose = require("mongoose");


const getAllNeeds = asyncWrapper(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    needType,
    status,
    urgencyLevel,
    categoryName,
    startDate,
    endDate,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const skip = (page - 1) * limit;

  // ✅ Filtering conditions
  let filter = {};
  if (needType) filter.needType = needType;
  if (status) filter.status = status;
  if (urgencyLevel) filter.urgencyLevel = urgencyLevel;
  if (categoryName) filter["category.categoryName"] = categoryName;
  if (startDate && endDate) {
    filter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  // ✅ Sorting logic
  const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  // ✅ Aggregation Pipeline
  const needs = await Need.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: "users",
        localField: "NGO",
        foreignField: "_id",
        as: "ngoDetails",
      },
    },
    { $unwind: "$ngoDetails" },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        needType: 1,
        urgencyLevel: 1,
        status: 1,
        targetMoney: 1,
        "beneficiaryInfo.numberOfBeneficiaries": 1,
        "beneficiaryInfo.location": 1,
        category: 1,
        endDate: 1,
        createdAt: 1,
        "ngoDetails._id": 1,
        "ngoDetails.name": 1,
        "ngoDetails.email": 1,
      },
    },
    { $sort: sortOptions },
    { $skip: skip },
    { $limit: parseInt(limit) },
  ]);

  // ✅ Count total documents for pagination metadata
  const totalDocuments = await Need.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: needs.length,
    totalPages: Math.ceil(totalDocuments / limit),
    currentPage: Number(page),
    data: needs,
  });
});

const getNeedsByNGO = asyncWrapper(async (req, res, next) => {
  const { ngoId } = req.params;
  const { page = 1, limit = 10, status, urgencyLevel, needType } = req.query;
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);
  const skip = (parsedPage - 1) * parsedLimit;

  // ✅ Validate ObjectId before querying MongoDB
  if (!mongoose.Types.ObjectId.isValid(ngoId)) {
    return next(new AppError("Invalid NGO ID", 400));
  }

  // ✅ Filtering Conditions
  let filter = { NGO: ngoId };
  if (status) filter.status = status;
  if (urgencyLevel) filter.urgencyLevel = urgencyLevel;
  if (needType) filter.needType = needType;

  // ✅ Get needs by NGO with pagination & structured response
  const needs = await Need.find(filter)
    .populate("NGO", "name email phone organizationName") // Get NGO details
    .sort({ createdAt: -1 }) // Sort by latest needs first
    .skip(skip)
    .limit(parsedLimit)
    .lean(); // Optimize performance by returning a plain object

  // ✅ Count total documents for pagination metadata
  const totalDocuments = await Need.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: needs.length,
    totalPages: Math.ceil(totalDocuments / parsedLimit),
    currentPage: parsedPage,
    data: needs.map((need) => ({
      _id: need._id,
      title: need.title,
      needType: need.needType,
      urgencyLevel: need.urgencyLevel,
      description: need.description,
      status: need.status,
      endDate: need.endDate,
      targetMoney: need.needType === "money" ? need.targetMoney : undefined,
      category: need.category,
      beneficiaryInfo: need.beneficiaryInfo,
      totalDonated: need.totalDonated,
      NGO: {
        id: need.NGO._id,
        name: need.NGO.name,
        email: need.NGO.email,
        phone: need.NGO.phone || "N/A",
        organizationName: need.NGO.organizationName || "N/A",
      },
      createdAt: need.createdAt,
    })),
  });
});

const getNeedById = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  // ✅ Validate ObjectId before querying MongoDB
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid Need ID", 400));
  }

  // ✅ Find the need and populate related fields
  const need = await Need.findById(id)
    .populate("NGO", "name email phone organizationName") // Get NGO details
    .populate("donors.donor", "name email") // Get donor names
    .lean(); // Optimize performance by returning a plain object

  if (!need) {
    return next(new AppError("Need not found", 404));
  }

  res.status(200).json({
    success: true,
    data: {
      _id: need._id,
      title: need.title,
      needType: need.needType,
      urgencyLevel: need.urgencyLevel,
      description: need.description,
      status: need.status,
      endDate: need.endDate,
      targetMoney: need.needType === "money" ? need.targetMoney : undefined,
      category: need.category,
      beneficiaryInfo: need.beneficiaryInfo,
      totalDonated: need.totalDonated,
      donors: need.donors.map((d) => ({
        donorId: d.donor?._id || null,
        donorName: d.donor?.name || "Anonymous",
        donorEmail: d.donor?.email || "N/A",
        amount: d.amount || 0,
      })),
      NGO: {
        id: need.NGO._id,
        name: need.NGO.name,
        email: need.NGO.email,
        phone: need.NGO.phone || "N/A",
        organizationName: need.NGO.organizationName || "N/A",
      },
      createdAt: need.createdAt,
    },
  });
});


const postANeed = asyncWrapper(async (req, res, next) => {
  const {
    title,
    needType,
    urgencyLevel,
    description,
    endDate,
    targetMoney,
    beneficiaryInfo,
    category,
  } = req.body;

  // ✅ Ensure only NGOs can post needs
  if (req.user.role.toLowerCase() !== "ngo") {
    return next(new AppError("Only NGOs can post needs", 403));
  }

  // ✅ Validate endDate
  const now = new Date();
  if (new Date(endDate) <= now) {
    return next(new AppError("End date must be in the future.", 400));
  }

  // ✅ Create new need
  const newNeed = await Need.create({
    NGO: req.user._id,
    title,
    needType,
    urgencyLevel,
    description,
    endDate,
    targetMoney: needType === "money" ? targetMoney : undefined,
    beneficiaryInfo,
    category,
  });

  // ✅ Find all donors interested in this type of need
  const donors = await User.find({
    role: { $in: ["individual_donor", "organization_donor"] },
  });

  if (!donors.length) {
    return next(new AppError("No donors found.", 404));
  }

  const io = getIO();
  const notificationsToSave = [];

  donors.forEach((donor) => {
    const notificationMessage = `A new ${needType} need has been posted by ${req.user.name}: ${title}`;

    if (onlineUsers.has(donor._id.toString())) {
      // ✅ Send real-time notification if donor is online
      io.to(onlineUsers.get(donor._id.toString())).emit("newNotification", {
        message: notificationMessage,
        type: "need",
      });
    } else {
      // ✅ Save notification for offline donors
      notificationsToSave.push({
        recipient: donor._id,
        message: notificationMessage,
        type: "need",
      });
    }
  });

  // ✅ Insert notifications into database
  if (notificationsToSave.length > 0) {
    await Notification.insertMany(notificationsToSave);
  }

  res.status(201).json({
    success: true,
    message: "Need posted successfully. Donors have been notified.",
    data: newNeed,
  });
});
module.exports = {postANeed,getAllNeeds,getNeedsByNGO,getNeedById}