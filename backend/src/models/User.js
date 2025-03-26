const mongoose = require('mongoose');

const USER_ROLES = [
  'individual_donor',
  'organization_donor',
  'volunteer',
  'ngo',
  'admin',
];

// Define User Schema
const userSchema = new mongoose.Schema(
  {
    // COMMON FIELDS (Shared by all users)
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: { type: String, lowercase: true },
    phone: { type: String },

    newEmail: { type: String },
    newPhone: { type: String },

    isNewEmailVerified: { type: Boolean },
    isNewPhoneVerified: { type: Boolean },

    password: { type: String },
    role: { type: String, enum: USER_ROLES, required: true },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    emailVerificationToken: { type: String },
    isPhoneVerified: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    lastLogin: { type: Date },
    tokenVersion: { type: Number, default: 0 },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },

    isFirstLogin: { type: Boolean, default: true },

    googleId: { type: String },

    address: {
      country: { type: String, default: undefined },
      region: { type: String, default: undefined },
      city: { type: String, default: undefined },
    },
    location: {
      latitude: { type: Number, default: undefined },
      longitude: { type: Number, default: undefined },
    },
    profilePicture: { type: String, default: null },
    bankAccount: {
      account_number: { type: String },
      accountName: { type: String },
      bankName: { type: String },
    },
    donorType: {
      type: String,
      enum: ['individual', 'organization'],
      required: function () {
        return (
          this.role === 'individual_donor' || this.role === 'organization_donor'
        );
      },
    },

    // NGO DOCUMENTS (Only created if the user is an NGO)
    ngoVerificationDocs: {
      type: new mongoose.Schema(
        {
          registrationCertificate: { type: String, default: null },
          authorizationLetter: { type: String, default: null },
          additionalDocs: { type: [String], default: [] },
        },
        { _id: false }
      ),
      select: false,
    },

    // ORGANIZATION DONOR DOCUMENTS (Only created if the user is an Organization Donor)
    organizationVerificationDocs: {
      type: new mongoose.Schema(
        {
          licenseCertificate: { type: String, default: null },
          taxCertificate: { type: String, default: null },
          additionalDocs: { type: [String], default: [] },
        },
        { _id: false }
      ),
      select: false,
    },

    // VOLUNTEER DOCUMENTS (Only created if the user is a Volunteer)
    volunteerVerificationDocs: {
      type: new mongoose.Schema(
        {
          idCard: { type: String, default: null },
          trainingCertificate: { type: String, default: null },
          additionalDocs: { type: [String], default: [] },
        },
        { _id: false }
      ),
      select: false,
    },

    isVerified: { type: Boolean },

    // VOLUNTEER FIELDS
    skills: { type: [String], default: undefined },
    availability: {
      type: [
        {
          day: {
            type: String,
            enum: [
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
              'Sunday',
            ],
            required: true,
          },
          startTime: { type: String, required: true },
          endTime: { type: String, required: true },
        },
      ],
      default: undefined,
    },
  },
  { timestamps: true, strict: 'throw' }
);

module.exports = mongoose.model('User', userSchema);
