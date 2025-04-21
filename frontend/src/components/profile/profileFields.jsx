import {
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from '@ant-design/icons';

export const basicProfileFields = [
  {
    fieldName: 'name',
    label: 'Full Name',
    type: 'text',
    placeholder: 'Enter your full name',
    icon: <UserOutlined />,
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
    icon: <MailOutlined />,
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
    type: 'phone', // New type for phone with country code
    placeholder: 'Enter your phone number',
    icon: <PhoneOutlined />,
    roles: [
      'admin',
      'ngo',
      'volunteer',
      'individual_donor',
      'organization_donor',
    ],
    countryCodes: [
      { code: '+251', name: 'Ethiopia (+251)' },
      { code: '+1', name: 'USA/Canada (+1)' },
      { code: '+44', name: 'UK (+44)' },
      // Add more country codes as needed
    ],
  },
  {
    fieldName: 'address',
    label: 'Address',
    type: 'compound',
    icon: <EnvironmentOutlined />,
    roles: ['ngo', 'volunteer', 'individual_donor', 'organization_donor'],
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
    fieldName: 'servicePreference',
    label: 'Service Preferences',
    type: 'multiselect',
    options: [
      'Teaching & Tutoring',
      'Medical & First Aid',
      'Translation & Interpretation',
      'Construction & Manual Labor',
      'Technology Support (IT, Web, Digital)',
      'Event Assistance & Logistics',
      'Community Outreach & Awareness',
      'Food Distribution & Shelter Support',
    ],
  },
  {
    fieldName: 'languageProficiency',
    label: 'Language Proficiency',
    type: 'multiselect', // You can customize the UI accordingly
    options: ['Afaan Oromo', 'Amharic', 'Tigrinya', 'Somali', 'English'],
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
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-gray-800">
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
    fieldName: 'donorType',
    label: 'Donor Type',
    type: 'display',
    displayComponent: (value) => (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-gray-800">
        {value || 'Individual Donor'}
      </span>
    ),
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
