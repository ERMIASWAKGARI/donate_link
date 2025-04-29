const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const asyncWrapper = require("../middleware/asyncWrapper");
const AppError = require("../utils/appError");
const Payment = require("../models/paymentModel");
const Need = require("../models/needsModel");

const initializePayment = asyncWrapper(async (req, res) => {
  const {
    amount,
    email,
    name,
    phone,
    NGO,
    donorId,
    needId,
    message,
    currency,
  } = req.body;
  console.log("Initializing payment with data:", req.body);

  if (!amount || !NGO || !donorId || !needId) {
    throw new AppError("Missing required fields", 400);
  }

  const tx_ref = `donation-${uuidv4()}`;
  const paymentRecord = await Payment.create({
    needId,
    donorId,
    NGOId: NGO,
    amount,
    currency,
    description: message,
    tx_ref,
    status: "Pending",
    paymentMethod: "Chapa",
  });

  const response = await axios.post(
    "https://api.chapa.co/v1/transaction/initialize",
    {
      amount: amount,
      currency: currency || "ETB",
      email: email,
      first_name: name,
      phone_number: phone,
      tx_ref: tx_ref,
      callback_url: `${process.env.BACKEND_URL}/api/payment/verify`,
      return_url: `${process.env.FRONTEND_URL}/donor/payment-success`,
      customization: {
        title: "Donation",
        description: message || "Support our cause",
      },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    }
  );
const needBeingApplied= await Need.findById(needId);
  if (needBeingApplied) {
    needBeingApplied.hasDonations = true;
    await needBeingApplied.save();
  }
  res.json({
    status: "success",
    data: {
      checkout_url: response.data.data.checkout_url,
      paymentId: paymentRecord._id,
    },
  });
});

const verifyPayment = asyncWrapper(async (req, res) => {
  const { tx_ref, status, reference, amount, currency, payment_method } =
    req.body;

  if (!tx_ref || !status) {
    throw new AppError("Invalid webhook payload", 400);
  }

  // Verify transaction with Chapa API
  const verification = await axios.get(
    `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      },
    }
  );

  if (!verification.data?.data) {
    throw new AppError("Invalid verification response from Chapa", 400);
  }

  const paymentData = verification.data.data;
  const receiptUrl = paymentData.receipt_url || verification.config.url;

  const updatedPayment = await Payment.findOneAndUpdate(
    { tx_ref },
    {
      status: status === "success" ? "Completed" : "Failed",
      reference,
      amount: parseFloat(amount),
      currency,
      paymentMethod: payment_method,
      receiptUrl,
      customerEmail: paymentData.customer?.email,
      customerPhone: paymentData.customer?.phone_number,
      paymentDate: paymentData.created_at
        ? new Date(paymentData.created_at)
        : new Date(),
      updatedAt: new Date(),
      verificationData: paymentData,
    },
    { new: true, upsert: true }
  );

  res.status(200).json({
    status: "success",
    receiptUrl: updatedPayment.receiptUrl,
  });
});
const getMoneyDonations= asyncWrapper(async (req, res) => {
  const { needId } = req.params;
  const donations = await Payment.find({ needId }).populate("donorId");

  if (!donations) {
    return res.status(404).json({
      status: "fail",
      message: "No donations found",
    });
  }

  res.status(200).json({
    status: "success",
    data: donations,
  });
});
module.exports = {
  initializePayment,
  getMoneyDonations,
  verifyPayment,
};
