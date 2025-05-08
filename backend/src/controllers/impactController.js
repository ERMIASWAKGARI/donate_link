const express = require('express');
const User = require('../models/User');
const Payment = require('../models/paymentModel');

exports.getImpact = async (req, res) => {
  try {
    // Count individual donors
    const individualDonors = await User.countDocuments({
      role: 'individual_donor',
    });

    // Count organization donors
    const organizationDonors = await User.countDocuments({
      role: 'organization_donor',
    });

    // Count NGOs
    const ngos = await User.countDocuments({
      role: 'ngo',
    });

    // Calculate total completed donations by currency
    const completedPayments = await Payment.aggregate([
      {
        $match: { status: 'Completed' },
      },
      {
        $group: {
          _id: '$currency',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Create an object to hold donations by currency
    const donationsByCurrency = {};
    completedPayments.forEach((payment) => {
      donationsByCurrency[payment._id] = payment.totalAmount;
    });

    res.json({
      success: true,
      data: {
        totalDonors: individualDonors + organizationDonors,
        totalDonations: donationsByCurrency, // Just the raw amounts by currency
        totalNgos: ngos,
      },
    });
  } catch (error) {
    console.error('Error fetching impact stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch impact statistics',
    });
  }
};
