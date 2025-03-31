const User = require("../../models/User");
const Need = require("../../models/needsModel");
const Payment = require("../../models/paymentModel");
const {
  initializePayment,
  verifyPayment,
  transferToBank,
} = require("../../services/chapaService");

exports.initiateDonation = async (req, res) => {
  try {
    const { needId, amount, currency = "ETB", paymentMethod } = req.body;
    const donorId = req.user._id;

    // Validate amount
    if (amount < 10) {
      // Minimum 10 ETB
      return res
        .status(400)
        .json({ error: "Minimum donation amount is 10 ETB" });
    }

    // Get need and NGO details
    const need = await Need.findById(needId).populate("NGO");
    if (!need) {
      return res.status(404).json({ error: "Need not found" });
    }

    // Verify NGO has bank details
    const ngo = await User.findById(need.NGO._id);
    if (!ngo.bankAccount) {
      return res
        .status(400)
        .json({ error: "NGO has not registered bank details" });
    }
console.log(ngo)
    // Create transaction reference
    const tx_ref = `DON-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Initialize payment with Chapa
    const paymentData = {
      amount,
      currency,
      email: req.user.email,
      first_name: req.user.name.split(" ")[0],
      last_name: req.user.name.split(" ")[1] || "",
      tx_ref,
     
      callback_url: `${process.env.BACKEND_URL}/api/donation/verify`,
      meta: {
        donorId,
        needId,
        ngoId: need.NGO._id,
      },
    };

    const chapaResponse = await initializePayment(paymentData);

    // Create payment record
    const payment = new Payment({
      donor: donorId,
      need: needId,
      NGO: need.NGO._id,
      amount,
      currency,
      transactionID: tx_ref,
      paymentMethod,
      status: "Initiated",
      recipientBankDetails: {
        bankCode: ngo.bankAccount.bank_code,
        accountNumber: ngo.bankAccount.account_number,
        accountName: ngo.bankAccount.accountName,
      },
    });

    await payment.save();

    res.json({
      success: true,
      checkoutUrl: chapaResponse.data.checkout_url,
      paymentId: payment._id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { tx_ref } = req.body;
console.log(req.body)
    // Verify payment with Chapa
    const verification = await verifyPayment(tx_ref);
    if (verification.status !== "success") {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // Update payment status
    const payment = await Payment.findOneAndUpdate(
      { transactionID: tx_ref },
      {
        status: "completed",
        receiptURL: verification.data.receipt_url,
      },
      { new: true }
    );

    // Initiate bank transfer
    await transferToBank({
      amount: payment.amount,
      account_number: payment.recipientBankDetails.accountNumber,
      bank_code: payment.recipientBankDetails.bankCode,
      reference: `XFER-${tx_ref}`,
      beneficiary_name: payment.recipientBankDetails.accountName,
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
