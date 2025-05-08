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
    type: 'phone',
    placeholder: 'Enter your phone number',
    icon: <PhoneOutlined />,
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

export const ngoFields = [
  {
    fieldName: 'preferences',
    label: 'Preferences',
    type: 'multiselect',
    options: ['Food', 'Medical', 'Clothing', 'Learning', 'Drinking', 'Shelter'],
  },
];
