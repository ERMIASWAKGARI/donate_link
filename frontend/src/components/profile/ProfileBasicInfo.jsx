/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import {
  CalendarOutlined,
  CloseOutlined,
  EditOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
  UploadOutlined,
  UserOutlined,
  VerifiedOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Badge,
  Button,
  Card,
  DatePicker,
  Divider,
  Form,
  Input,
  message,
  Progress,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
  Upload,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

const API_BASE_URL = import.meta.env.BACKEND_URL || 'http://localhost:5000';

const ProfileBasicInfo = ({ user, loading, setLoading, onProfileUpdate }) => {
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [editingField, setEditingField] = useState(null);
  const navigate = useNavigate();

  // Calculate profile completion percentage
  useEffect(() => {
    let completedFields = 0;
    const totalFields = 6; // name, email, phone, address, bio, dob

    if (user?.name) completedFields++;
    if (user?.email && user?.isEmailVerified) completedFields++;
    if (user?.phone && user?.isPhoneVerified) completedFields++;
    if (user?.address) completedFields++;
    if (user?.bio) completedFields++;
    if (user?.dob) completedFields++;

    setProfileCompletion(Math.round((completedFields / totalFields) * 100));
  }, [user]);

  const handleCancelEdit = () => {
    setEditingField(null);
    form.resetFields();
  };

  const handleSaveField = async (fieldName) => {
    try {
      setLoading(true);
      const values = await form.validateFields([fieldName]);

      // Simulate API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 1000));

      message.success(`${fieldName.replace(/_/g, ' ')} updated successfully`);
      setEditingField(null);
      onProfileUpdate?.();
    } catch (error) {
      message.error(
        error.response?.data?.message || `Failed to update ${fieldName}`
      );
    } finally {
      setLoading(false);
    }
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG files!');
      return Upload.LIST_IGNORE;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
      return Upload.LIST_IGNORE;
    }
    return isJpgOrPng && isLt2M;
  };

  const getRoleTagColor = () => {
    switch (user.role) {
      case 'admin':
        return 'red';
      case 'ngo':
        return '#008080';
      case 'volunteer':
        return 'blue';
      case 'organization_donor':
        return 'green';
      case 'individual_donor':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const renderSocialLinks = () => {
    if (!user.socialLinks || !user.socialLinks.length) {
      return <Text type="secondary">No social links added</Text>;
    }

    return (
      <Space wrap>
        {user.socialLinks.map((link, index) => (
          <Tag
            key={index}
            icon={<GlobalOutlined />}
            color="#008080"
            className="cursor-pointer hover:bg-teal-50"
            onClick={() => window.open(link.url, '_blank')}
          >
            {link.platform}
          </Tag>
        ))}
      </Space>
    );
  };

  const renderEditButton = (fieldName) => (
    <Button
      type="text"
      icon={<EditOutlined />}
      onClick={() => setEditingField(fieldName)}
      className="text-[#008080] hover:text-[#006666]"
    />
  );

  const renderSaveCancelButtons = (fieldName) => (
    <Space>
      <Button
        type="text"
        icon={<CloseOutlined />}
        onClick={handleCancelEdit}
        disabled={loading}
      />
      <Button
        type="text"
        icon={<SaveOutlined />}
        onClick={() => handleSaveField(fieldName)}
        loading={loading}
        className="text-[#008080] hover:text-[#006666]"
      />
    </Space>
  );

  return (
    <Card>
      <div className="text-center mb-6 relative">
        <Badge
          count={profileCompletion === 100 ? '✓' : `${profileCompletion}%`}
          color={profileCompletion === 100 ? '#52c41a' : '#008080'}
          offset={[-20, 80]}
        >
          <Upload
            name="avatar"
            showUploadList={false}
            beforeUpload={beforeUpload}
            disabled={uploading}
            customRequest={async ({ file, onSuccess, onError }) => {
              try {
                setUploading(true);
                await new Promise((resolve) => setTimeout(resolve, 1500));
                message.success('Profile picture updated successfully');
                onSuccess();
                onProfileUpdate?.();
              } catch (error) {
                message.error(
                  error.response?.data?.message || 'Failed to upload image'
                );
                onError();
              } finally {
                setUploading(false);
              }
            }}
          >
            <div className="relative inline-block group">
              <Avatar
                size={128}
                src={
                  user.profilePicture
                    ? `http://localhost:5000/uploads/${user.profilePicture}`
                    : `https://ui-avatars.com/api/?name=${user.name}&background=008080&color=fff&size=128&bold=true`
                }
                icon={<UserOutlined />}
                className="border-2 border-[#008080] hover:border-[#006666] transition-all duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <UploadOutlined
                  className="text-white text-xl"
                  style={{ fontSize: 24 }}
                />
              </div>
            </div>
          </Upload>
        </Badge>

        <Title level={3} className="mt-4 mb-1 font-semibold text-[#008080]">
          {user.name}
          {user.isVerified && (
            <Tooltip title="Verified Account">
              <VerifiedOutlined className="ml-2 text-yellow-400" />
            </Tooltip>
          )}
        </Title>

        <div className="flex justify-center items-center gap-2 mb-3">
          <Tag
            color={getRoleTagColor()}
            className="uppercase tracking-wide font-semibold"
          >
            {user.role.replace('_', ' ')}
          </Tag>
          {user.memberSince && (
            <Tag color="default">
              Member since {dayjs(user.memberSince).format('MMM YYYY')}
            </Tag>
          )}
        </div>

        <Progress
          percent={profileCompletion}
          size="small"
          status={profileCompletion === 100 ? 'success' : 'active'}
          showInfo={false}
          strokeColor={profileCompletion === 100 ? '#52c41a' : '#008080'}
          className="max-w-xs mx-auto"
        />
        <Text type="secondary" className="text-xs">
          Profile {profileCompletion}% complete
        </Text>
      </div>

      <Divider orientation="left" className="font-medium text-[#008080]">
        Basic Information
      </Divider>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          address: user.address || '',
          bio: user.bio || '',
          dob: user.dob ? dayjs(user.dob) : null,
          gender: user.gender || '',
        }}
      >
        <Form.Item
          label="Full Name"
          name="name"
          rules={[{ required: true, message: 'Please input your name!' }]}
        >
          <div className="flex items-center justify-between">
            {editingField === 'name' ? (
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="John Doe"
                className="flex-1"
              />
            ) : (
              <div className="profile-info-item flex items-center">
                <UserOutlined className="mr-3 text-gray-500" />
                <Text strong>{user.name}</Text>
              </div>
            )}
            {editingField === 'name'
              ? renderSaveCancelButtons('name')
              : renderEditButton('name')}
          </div>
        </Form.Item>

        <Form.Item label="Email" name="email">
          <div className="flex items-center justify-between">
            <div className="profile-info-item flex items-center">
              <MailOutlined className="mr-3 text-gray-500" />
              <div className="flex items-center">
                <Text>{user.email}</Text>
                {user.isEmailVerified ? (
                  <Tag
                    color="green"
                    icon={<VerifiedOutlined />}
                    className="ml-2"
                  >
                    Verified
                  </Tag>
                ) : (
                  <div className="flex items-center ml-2">
                    <Tag color="orange">Not Verified</Tag>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => message.info('Verification email sent')}
                      className="ml-1 text-xs text-[#008080] hover:text-[#006666]"
                    >
                      Verify Now
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Form.Item>

        <Form.Item
          label="Phone Number"
          name="phone"
          rules={[
            {
              pattern: /^[0-9+\- ]+$/,
              message: 'Please enter a valid phone number',
            },
          ]}
        >
          <div className="flex items-center justify-between">
            {editingField === 'phone' ? (
              <Input
                prefix={<PhoneOutlined className="text-gray-400" />}
                placeholder="+1 234 567 8900"
                className="flex-1"
              />
            ) : (
              <div className="profile-info-item flex items-center">
                <PhoneOutlined className="mr-3 text-gray-500" />
                <div className="flex items-center">
                  <Text>{user.phone || 'Not provided'}</Text>
                  {user.phone && user.isPhoneVerified && (
                    <Tag
                      color="green"
                      icon={<VerifiedOutlined />}
                      className="ml-2"
                    >
                      Verified
                    </Tag>
                  )}
                </div>
              </div>
            )}
            {editingField === 'phone'
              ? renderSaveCancelButtons('phone')
              : renderEditButton('phone')}
          </div>
        </Form.Item>

        {/* Similar pattern for other fields */}
        <Form.Item label="Date of Birth" name="dob">
          <div className="flex items-center justify-between">
            {editingField === 'dob' ? (
              <DatePicker
                style={{ width: '100%' }}
                placeholder="Select your birth date"
                suffixIcon={<CalendarOutlined className="text-gray-400" />}
              />
            ) : (
              <div className="profile-info-item flex items-center">
                <CalendarOutlined className="mr-3 text-gray-500" />
                <Text>
                  {user.dob
                    ? dayjs(user.dob).format('MMMM D, YYYY')
                    : 'Not provided'}
                </Text>
              </div>
            )}
            {editingField === 'dob'
              ? renderSaveCancelButtons('dob')
              : renderEditButton('dob')}
          </div>
        </Form.Item>

        <Form.Item label="Gender" name="gender">
          <div className="flex items-center justify-between">
            {editingField === 'gender' ? (
              <Select
                placeholder="Select your gender"
                style={{ width: '100%' }}
              >
                <Option value="male">Male</Option>
                <Option value="female">Female</Option>
                <Option value="other">Other</Option>
                <Option value="prefer-not-to-say">Prefer not to say</Option>
              </Select>
            ) : (
              <div className="profile-info-item flex items-center">
                <IdcardOutlined className="mr-3 text-gray-500" />
                <Text>
                  {user.gender
                    ? user.gender.replace(/-/g, ' ')
                    : 'Not specified'}
                </Text>
              </div>
            )}
            {editingField === 'gender'
              ? renderSaveCancelButtons('gender')
              : renderEditButton('gender')}
          </div>
        </Form.Item>

        <Form.Item label="Address" name="address">
          <div className="flex items-center justify-between">
            {editingField === 'address' ? (
              <Input.TextArea
                prefix={<EnvironmentOutlined className="text-gray-400" />}
                placeholder="123 Main St, City, Country"
                rows={2}
                className="flex-1"
              />
            ) : (
              <div className="profile-info-item flex items-start">
                <EnvironmentOutlined className="mr-3 mt-1 text-gray-500" />
                <Text>{user.address || 'Not provided'}</Text>
              </div>
            )}
            {editingField === 'address'
              ? renderSaveCancelButtons('address')
              : renderEditButton('address')}
          </div>
        </Form.Item>

        <Form.Item label="Bio" name="bio">
          <div className="flex items-center justify-between">
            {editingField === 'bio' ? (
              <Input.TextArea
                placeholder="Tell us about yourself..."
                rows={3}
                maxLength={200}
                showCount
                className="flex-1"
              />
            ) : (
              <div className="profile-info-item flex items-start">
                <UserOutlined className="mr-3 mt-1 text-gray-500" />
                <Text>{user.bio || 'No bio added yet'}</Text>
              </div>
            )}
            {editingField === 'bio'
              ? renderSaveCancelButtons('bio')
              : renderEditButton('bio')}
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ProfileBasicInfo;
