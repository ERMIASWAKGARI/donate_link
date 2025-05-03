const mongoose = require('mongoose');

const needsSchema = new mongoose.Schema(
  {
    NGO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    hasDonations: {
      type: Boolean,
      default: false,
    },
    needTypes: {
      type: [
        {
          type: String,
          enum: ['money', 'material', 'service'],
        },
      ],
      required: true,
      validate: {
        validator: function (v) {
          return v.length > 0 && v.length <= 3 && new Set(v).size === v.length;
        },
        message: 'Must specify 1-3 unique need types',
      },
    },

    urgencyLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    status: {
      type: String,
      enum: ['Open', 'Fulfilled', 'Expired', 'Closed'],
      default: 'Open',
    },

    endDate: {
      type: Date,
      required: true,
    },

    targetMoney: {
      type: Number,
      required: function () {
        return this.needTypes.includes('money');
      },
      min: 0,
      default: null,
    },

    beneficiaryInfo: {
      numberOfBeneficiaries: {
        type: Number,
        required: true,
        min: 1,
      },
      pictures: {
        type: [String], // Ensure it's an array of strings
        validate: {
          validator: function (v) {
            return v.length <= 10; // Correctly check the total number of images
          },
          message: 'Cannot upload more than 10 pictures',
        },
      },
      location: {
        latitude: {
          type: Number,
          required: true,
          min: -90,
          max: 90,
        },
        longitude: {
          type: Number,
          required: true,
          min: -180,
          max: 180,
        },
        address: {
          type: String,
          required: true,
        },
      },
    },
    application: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
      },
    ],
    isReportGenerated: {
      type: Boolean,
      default: false,
    },
    categories: {
      material: [
        {
          categoryName: {
            type: String,
            required: function () {
              return this.parent().parent().needTypes.includes('material');
            },
            maxlength: 50,
          },
          subCategoryName: {
            type: String,
            required: function () {
              return this.parent().parent().needTypes.includes('material');
            },
            maxlength: 50,
          },
          targetAmountNeeded: {
            type: String,
            required: function () {
              return this.parent().parent().needTypes.includes('material');
            },
            min: 1,
          },
          unit: {
            type: String,
          },
        },
      ],

      service: [
        {
          categoryName: {
            type: String,
            required: function () {
              return this.parent().parent().needTypes.includes('service');
            },
            maxlength: 50,
          },
          subCategoryName: {
            type: String,
            required: function () {
              return this.parent().parent().needTypes.includes('service');
            },
            maxlength: 50,
          },
          vacancy: {
            type: String,
            required: function () {
              return this.parent().parent().needTypes.includes('service');
            },
            min: 1,
          },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

needsSchema.pre('save', function (next) {
  if (this.endDate <= new Date() && this.status !== 'Closed') {
    this.status = 'Closed';
  }
  next();
});

// Middleware to check for expired needs on every find operation (optional)
needsSchema.post('find', function (docs) {
  docs.forEach((doc) => {
    if (doc.endDate <= new Date() && doc.status !== 'Closed') {
      doc.status = 'Closed';
      doc.save();
    }
  });
});

module.exports = mongoose.model('Needs', needsSchema);
