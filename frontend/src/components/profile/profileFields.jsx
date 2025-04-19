export const basicProfileFields = [
  {
    fieldName: 'name',
    label: 'Full Name',
    type: 'text',
    placeholder: 'Enter your full name',
    roles: [
      'admin',
      'ngo',
      'volunteer',
      'individual_donor',
      'organization_donor',
    ],
  },
  {
    fieldName: 'email',
    label: 'Email Address',
    type: 'email',
    placeholder: 'Enter your email',
    readOnly: true,
    roles: [
      'admin',
      'ngo',
      'volunteer',
      'individual_donor',
      'organization_donor',
    ],
  },
  {
    fieldName: 'phone',
    label: 'Phone Number',
    type: 'tel',
    placeholder: 'Enter your phone number',
    roles: [
      'admin',
      'ngo',
      'volunteer',
      'individual_donor',
      'organization_donor',
    ],
  },
  {
    fieldName: 'address',
    label: 'Address',
    type: 'compound',
    roles: ['ngo', 'volunteer', 'individual_donor', 'organization_donor'], // Exclude admin
    fields: [
      {
        fieldName: 'country',
        label: 'Country',
        type: 'text',
        placeholder: 'Enter your country',
      },
      {
        fieldName: 'region',
        label: 'Region/State',
        type: 'text',
        placeholder: 'Enter your region/state',
      },
      {
        fieldName: 'city',
        label: 'City',
        type: 'text',
        placeholder: 'Enter your city',
      },
    ],
  },
];

export const volunteerFields = [
  {
    fieldName: 'skills',
    label: 'Skills',
    type: 'multiselect',
    options: [
      'First Aid',
      'Teaching',
      'Construction',
      'Medical',
      'Translation',
    ],
  },
  {
    fieldName: 'availability',
    label: 'Availability',
    type: 'availability',
    days: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
  },
];

// Add these to your existing profileFields.js
export const adminFields = [
  {
    fieldName: 'adminLevel',
    label: 'Admin Level',
    type: 'display', // Special type for non-editable display
    displayComponent: (value) => (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        {value || 'Standard'}
      </span>
    ),
  },
  {
    fieldName: 'lastAction',
    label: 'Last System Action',
    type: 'display',
    displayComponent: (value) => (
      <span className="text-sm text-gray-900">
        {value || 'No recent actions'}
      </span>
    ),
  },
  {
    fieldName: 'permissions',
    label: 'Permissions',
    type: 'display',
    displayComponent: (value) => (
      <div className="mt-1">
        {value?.map((permission) => (
          <span
            key={permission}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 mb-2"
          >
            {permission}
          </span>
        ))}
        {!value?.length && (
          <span className="text-gray-500 text-sm">No special permissions</span>
        )}
      </div>
    ),
  },
];

export const donorFields = [
  {
    fieldName: 'organizationName',
    label: 'Organization Name',
    type: 'text',
    placeholder: 'Enter organization name',
    showIf: (user) => user.role === 'organization_donor',
  },
  {
    fieldName: 'preferredDonations',
    label: 'Preferred Donations',
    type: 'multiselect',
    options: ['Money', 'Food', 'Clothing', 'Medical Supplies', 'Other'],
  },
  {
    fieldName: 'donationFrequency',
    label: 'Donation Frequency',
    type: 'select',
    options: ['', 'One-time', 'Monthly', 'Quarterly', 'Annually'],
  },
];

export const ngoFields = [
  {
    fieldName: 'organizationName',
    label: 'Organization Name',
    type: 'text',
    placeholder: 'Enter organization name',
  },
  {
    fieldName: 'missionStatement',
    label: 'Mission Statement',
    type: 'textarea',
    rows: 4,
    placeholder: 'Enter your mission statement',
  },
  {
    fieldName: 'registrationNumber',
    label: 'Registration Number',
    type: 'text',
    placeholder: 'Enter registration number',
  },
];
