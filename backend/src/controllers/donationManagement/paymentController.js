const asyncWrapper = require("../../middleware/asyncWrapper");
const Need = require("../../models/needsModel");
const AppError = require("../../utils/appError");
const Payment = require("../../models/paymentModel");
const axios = require("axios");

exports.initiatePayment = asyncWrapper(async (req, res, next) => {
  const { amount, needId, paymentMethod } = req.body;
  const { user } = req;

  if (!amount || !needId || !paymentMethod) {
    return next(
      new AppError("Amount, needId, and paymentMethod are required.", 400)
    );
  }

  // ✅ Validate Need
  const need = await Need.findById(needId);
  if (!need || need.needType !== "money") {
    return next(new AppError("Invalid or non-monetary need", 400));
  }

  if (!need.bankAccount) {
    return next(
      new AppError("This NGO has not provided a valid bank account.", 400)
    );
  }

  // ✅ Generate Transaction ID
  const transactionId = `CHAPA_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 8)}`;

  // ✅ Create Payment Record Before Sending to Chapa
  const description = `Donation for: ${need.description}`;
  const payment = await Payment.create({
    donor: user._id,
    NGO: need.NGO,
    need: need._id,
    amount,
    transactionID: transactionId,
    description,
    paymentMethod,
    status: "Pending",
    bankAccount: need.bankAccount, // Add the NGO's bank account here
  });

  // ✅ Prepare Request Data for Chapa API
  const requestData = {
    amount,
    currency: "ETB",
    email: user.email,
    first_name: user.fullName || "Donor",
    tx_ref: transactionId,
    callback_url: `${process.env.BACKEND_URL}/api/donation/verifyPayment`,
    return_url: `${process.env.FRONTEND_URL}/payment-complete`,
    bank_account: need.bankAccount, // Direct transfer to NGO's bank account
    customization: {
      title: `Donation to NGO`,
      description: `You are donating ${amount} ETB for this cause.`,
    },
  };

  try {
    // ✅ Call Chapa API
    const response = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      requestData,
      {
        headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` },
      }
    );

    if (response.data.status !== "success") {
      throw new Error("Chapa API failed to initiate payment");
    }

    res.status(200).json({
      success: true,
      message: "Payment initiated",
      checkoutUrl: response.data.data.checkout_url,
      transactionId,
    });
  } catch (error) {
    console.error(
      "Chapa Payment Error:",
      error.response?.data || error.message
    );
    return next(new AppError("Payment initiation failed", 500));
  }
});



exports.verifyPayment = asyncWrapper(async (req, res, next) => {
  const { transactionId } = req.body;

  if (!transactionId) {
    return next(new AppError("Transaction ID is required.", 400));
  }

  // ✅ Fetch Payment Record
  const payment = await Payment.findOne({
    transactionID: transactionId,
  }).populate("NGO");
  if (!payment) {
    return next(new AppError("Payment not found", 404));
  }

  // ✅ Check if payment was already completed
  if (payment.status === "Completed") {
    return res.status(200).json({
      success: true,
      message: "Payment was already verified.",
      data: payment,
    });
  }

  // ✅ Verify with Chapa API
  let chapaResponse;
  try {
    chapaResponse = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${transactionId}`,
      { headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` } }
    );
  } catch (error) {
    console.error(
      "Chapa Verification Error:",
      error.response?.data || error.message
    );
    return next(new AppError("Error verifying payment with Chapa", 500));
  }

  const chapaStatus = chapaResponse.data.data.status;

  // ✅ If payment failed, update status
  if (chapaStatus !== "success") {
    payment.status = "Failed";
    payment.updatedAt = Date.now();
    await payment.save();
    return next(new AppError("Payment failed", 400));
  }

  // ✅ Update Payment Record
  payment.status = "Completed";
  payment.reference = chapaResponse.data.data.tx_ref;
  payment.receiptURL = chapaResponse.data.data.receipt_url || null;
  payment.updatedAt = Date.now();
  await payment.save();

  // ✅ Transfer Funds to NGO
  const transferResult = await exports.transferFundsToNGO(payment);

  if (transferResult.status === "Completed") {
    payment.status = "Transferred";
    payment.transferReference = transferResult.transferReference;
    payment.transferReceiptURL = transferResult.transferReceiptURL;
  } else {
    payment.status = "Transfer Failed";
    payment.errorMessage = transferResult.error;
  }

  await payment.save();

  // ✅ Update Need Donations
  const need = await Need.findById(payment.need);
  if (need) {
    need.totalDonated += payment.amount;
    need.donors.push({ donor: payment.donor, amount: payment.amount });

    if (need.totalDonated >= need.amount) {
      need.status = "Fulfilled";
    }
    await need.save();
  }

  // ✅ Notify NGO About Donation
  const io = getIO();
  const notificationMessage = `You have received a donation of ${payment.amount} ETB.`;

  if (onlineUsers.has(payment.NGO._id.toString())) {
    io.to(onlineUsers.get(payment.NGO._id.toString())).emit("newNotification", {
      message: notificationMessage,
      type: "payment",
    });
  } else {
    await Notification.create({
      recipient: payment.NGO._id,
      message: notificationMessage,
      type: "payment",
    });
  }

  res.status(200).json({
    success: true,
    message:
      "Payment verified and transferred successfully. Notification sent to NGO.",
    data: payment,
  });
});


exports.transferFundsToNGO = asyncWrapper(async (payment) => {
  console.log('i am transferring')
  if (!payment || !payment.bankAccount) {
    throw new Error("Invalid payment details or missing bank account.");
  }

  const transferReference = `CHAPA_TRANSFER_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 8)}`;

  const transferData = {
    account_name: payment.NGO.organizationName, // NGO Name
    account_number: payment.bankAccount,
    amount: payment.amount,
    currency: "ETB",
    reference: transferReference,
    narration: `Donation payout for ${payment.description}`,
    beneficiary_name: payment.NGO.organizationName,
  };

  try {
    const response = await axios.post(
      "https://api.chapa.co/v1/transfers", // Chapa Transfer API
      transferData,
      { headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` } }
    );

    if (response.data.status !== "success") {
      throw new Error("Chapa Transfer API failed");
    }

    return {
      status: "Completed",
      transferReference,
      transferReceiptURL: response.data.data.receipt_url || null,
    };
  } catch (error) {
    console.error(
      "Chapa Transfer Error:",
      error.response?.data || error.message
    );
    return { status: "Failed", error: error.message };
  }
});
