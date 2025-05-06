const { getIO } = require("../utils/socketConfig");
const asyncWrapper = require("../middleware/asyncWrapper");
const AppError = require("../utils/appError");
const sendSuccessResponse = require("../utils/responseHelper");
const Application = require("../models/applicationModel");
const Needs = require("../models/needsModel");
const Notification = require("../models/notificationModel");

const User = require("../models/User");

// @desc    Get all applications for a specific need
// @route   GET /api/needs/:needId/applications
// @access  Private (NGO)

exports.createApplication = asyncWrapper(async (req, res, next) => {
  console.log("[Application] Creating new application...");
  const { needId } = req.params;
  const userId = req.user._id;
  console.log(`[Application] User ${userId} applying for need ${needId}`);

  const {
    motivation,
    startDate,
    endDate,
    hoursPerWeek,
    category,
    subCategory,
  } = req.body;

  // Validate need exists with NGO
  console.log("[Application] Validating need...");
  const need = await Needs.findById(needId).populate("NGO");
  if (!need) {
    console.error("[Application] Need not found");
    return next(new AppError("Need not found", 404));
  }
  if (!need.NGO) {
    console.error("[Application] Need has no associated NGO");
    return next(new AppError("Need has no associated NGO", 400));
  }

  // Prevent duplicate applications
  console.log("[Application] Checking for existing applications...");
  const existingApplication = await Application.findOne({
    need: needId,
    applicant: userId,
  });
  if (existingApplication) {
    console.error("[Application] Duplicate application found");
    return next(new AppError("You have already applied for this need", 400));
  }

  // Create application
  console.log("[Application] Creating new application record...");
  const newApplication = await Application.create({
    applicant: userId,
    need: needId,
    category,
    subCategory,
    motivation,
    startDate,
    endDate,
    hoursPerWeek,
    status: "Submitted",
    NGO:req?.user?._id
  });
  console.log(`[Application] Created application ID: ${newApplication._id}`);

  // Notification handling
  try {
    console.log("[Notification] Creating notification...");
    const notification = await Notification.create({
      recipient: need.NGO._id,
      sender: userId,
      message: `New application for "${need.title}" from ${req.user.name}`,
      type: "application",
      seen: false,
      metadata: {
        applicationId: newApplication._id,
        needId: need._id,
        applicantId: userId,
      },
    });
    console.log(
      `[Notification] Created notification ID: ${notification._id} for recipient ${need.NGO._id}`
    );

    // Get updated unread count
    const unreadCount = await Notification.countDocuments({
      recipient: need.NGO._id,
      seen: false,
    });
    console.log(
      `[Notification] Current unread count for ${need.NGO._id}: ${unreadCount}`
    );

    // Real-time notification
    const io = getIO();
    if (io) {
      console.log("[Socket] IO instance found");
      const ngoRoom = need.NGO._id.toString();
      console.log(`[Socket] Preparing to emit to NGO room: ${ngoRoom}`);

      // Emit both notification and unread count
      io.to(ngoRoom).emit("notificationUpdate", {
        notification: {
          _id: notification._id,
          message: notification.message,
          type: notification.type,
          createdAt: notification.createdAt,
          seen: notification.seen,
          metadata: notification.metadata,
        },
        unreadCount,
      });
      console.log("[Socket] Emitted notificationUpdate event");

      // For debugging: list all rooms
      const rooms = io.sockets.adapter.rooms;
      console.log("[Socket] Current rooms:", rooms);

      // Additional debug: check if NGO is connected
      io.in(ngoRoom)
        .allSockets()
        .then((sockets) => {
          console.log(`[Socket] Clients in room ${ngoRoom}:`, sockets.size);
          if (sockets.size === 0) {
            console.warn("[Socket] No clients in the NGO room!");
          }
        });
    } else {
      console.error("[Socket] No IO instance available");
    }
  } catch (err) {
    console.error("[Notification] Processing failed:", err);
    // Continue even if notification fails
  }

  return sendSuccessResponse(res, 201, {
    message: "Application submitted successfully",
    application: newApplication,
  });
});

// Add this to your controller file
exports.checkApplicationStatus = asyncWrapper(async (req, res, next) => {
  const { needId } = req.params;
  const userId = req.user._id;

  const existingApplication = await Application.findOne({
    need: needId,
    applicant: userId,
  });

  // Direct response without using sendSuccessResponse
  res.status(200).json({
    status: "success",
    message: "Application status checked",
    data: {
      hasApplied: !!existingApplication,
    },
  });
});
exports.getNeedApplications = asyncWrapper(async (req, res, next) => {
  const { needId } = req.params;
  const { status, search } = req.query;

  // Verify the need exists and belongs to the NGO
  const need = await Needs.findOne({
    _id: needId,
    ngo: req.user._id,
  });

  if (!need) {
    return next(new AppError("Need not found or unauthorized", 404));
  }

  // Build query
  const query = {
    need: needId,
    ...(status && status !== "all" && { status }),
    ...(search && {
      $or: [
        { "applicant.name": { $regex: search, $options: "i" } },
        { motivation: { $regex: search, $options: "i" } },
      ],
    }),
  };

  const applications = await Application.find(query)
    .populate({
      path: "applicant",
      select: "name email profilePicture skills availability",
    })
    .sort({ createdAt: -1 });

  sendSuccessResponse(res, 200, {
    count: applications.length,
    applications,
  });
});

// @desc    Update application status
// @route   PATCH /api/applications/:id
// @access  Private (NGO)
exports.updateApplicationStatus = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  // Verify the application exists and belongs to the NGO's need
  const application = await Application.findOne({
    _id: id,
    need: { $in: await Needs.find({ ngo: req.user._id }).distinct("_id") },
  });

  if (!application) {
    return next(new AppError("Application not found or unauthorized", 404));
  }

  // Update status
  application.status = status;
  await application.save();

  // Populate applicant info
  const populatedApp = await Application.findById(application._id).populate({
    path: "applicant",
    select: "name email",
  });

  sendSuccessResponse(res, 200, {
    application: populatedApp,
  });
});

// @desc    Bulk update application statuses
// @route   PATCH /api/applications/bulk
// @access  Private (NGO)
exports.bulkUpdateApplications = asyncWrapper(async (req, res, next) => {
  const { ids, status } = req.body;

  if (!ids || !ids.length) {
    return next(new AppError("No application IDs provided", 400));
  }

  // Verify all applications belong to needs owned by this NGO
  const needs = await Needs.find({ ngo: req.user._id }).distinct("_id");

  const { modifiedCount } = await Application.updateMany(
    {
      _id: { $in: ids },
      need: { $in: needs },
    },
    { status }
  );

  if (modifiedCount === 0) {
    return next(new AppError("No applications found or unauthorized", 404));
  }

  const applications = await Application.find({ _id: { $in: ids } }).populate({
    path: "applicant",
    select: "name email",
  });

  sendSuccessResponse(res, 200, {
    modifiedCount,
    applications,
  });
});

// @desc    Get all needs for an NGO with application counts
// @route   GET /api/ngos/:ngoId/needs
// @access  Private (NGO)
exports.getNgoNeeds = asyncWrapper(async (req, res, next) => {
  const { ngoId } = req.params;

  // Verify the requesting user is the NGO
  if (req.user._id.toString() !== ngoId && req.user.role !== "admin") {
    return next(new AppError("Not authorized", 401));
  }

  const needs = await Needs.aggregate([
    { $match: { ngo: mongoose.Types.ObjectId(ngoId) } },
    {
      $lookup: {
        from: "applications",
        localField: "_id",
        foreignField: "need",
        as: "applications",
      },
    },
    {
      $project: {
        title: 1,
        description: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        applicationsCount: { $size: "$applications" },
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  sendSuccessResponse(res, 200, {
    count: needs.length,
    needs,
  });
});
