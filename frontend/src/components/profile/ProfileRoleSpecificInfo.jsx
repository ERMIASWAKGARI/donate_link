/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import {
  BankOutlined,
  CloseOutlined,
  EditOutlined,
  SafetyOutlined,
  SaveOutlined,
  SolutionOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Button, Card, Divider, Form, Input, Select, Space, Tag } from 'antd';
import { useState } from 'react';

const { Option } = Select;
const { TextArea } = Input;

const ProfileRoleSpecificInfo = ({ user, onProfileUpdate }) => {
  const [form] = Form.useForm();
  const [editingField, setEditingField] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCancelEdit = () => {
    setEditingField(null);
    form.resetFields();
  };

  const handleSaveField = async (fieldName) => {
    try {
      setLoading(true);
      const values = await form.validateFields([fieldName]);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // message.success(
      //   `${fieldName.replace(/([A-Z])/g, ' $1').trim()} updated successfully`
      // );
      setEditingField(null);
      onProfileUpdate?.();
    } catch (error) {
      // message.error(
      //   error.response?.data?.message || `Failed to update ${fieldName}`
      // );
    } finally {
      setLoading(false);
    }
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

  const renderVolunteerInfo = () => (
    <>
      <Divider orientation="left" className="text-[#008080]">
        <TeamOutlined /> Volunteer Information
      </Divider>
      <Form.Item label="Skills" name="skills">
        <div className="flex items-center justify-between">
          {editingField === 'skills' ? (
            <Select
              mode="tags"
              placeholder="Add your skills"
              className="flex-1"
            >
              {[
                'First Aid',
                'Teaching',
                'Construction',
                'Medical',
                'Translation',
              ].map((skill) => (
                <Option key={skill} value={skill}>
                  {skill}
                </Option>
              ))}
            </Select>
          ) : (
            <div className="profile-info-item">
              {user.skills?.length > 0
                ? user.skills.map((skill) => (
                    <Tag key={skill} color="#008080">
                      {skill}
                    </Tag>
                  ))
                : 'No skills specified'}
            </div>
          )}
          {editingField === 'skills'
            ? renderSaveCancelButtons('skills')
            : renderEditButton('skills')}
        </div>
      </Form.Item>
      <Form.Item label="Availability" name="availability">
        <div className="flex items-center justify-between">
          {editingField === 'availability' ? (
            <Select placeholder="Select your availability" className="flex-1">
              <Option value="Weekdays">Weekdays</Option>
              <Option value="Weekends">Weekends</Option>
              <Option value="Both">Both</Option>
            </Select>
          ) : (
            <div className="profile-info-item">
              {user.availability || 'Not specified'}
            </div>
          )}
          {editingField === 'availability'
            ? renderSaveCancelButtons('availability')
            : renderEditButton('availability')}
        </div>
      </Form.Item>
    </>
  );

  const renderNgoInfo = () => (
    <>
      <Divider orientation="left" className="text-[#008080]">
        <BankOutlined /> NGO Information
      </Divider>
      <Form.Item label="Organization Name" name="organizationName">
        <div className="flex items-center justify-between">
          {editingField === 'organizationName' ? (
            <Input className="flex-1" />
          ) : (
            <div className="profile-info-item">
              {user.organizationName || 'Not specified'}
            </div>
          )}
          {editingField === 'organizationName'
            ? renderSaveCancelButtons('organizationName')
            : renderEditButton('organizationName')}
        </div>
      </Form.Item>
      <Form.Item label="Mission Statement" name="missionStatement">
        <div className="flex items-center justify-between">
          {editingField === 'missionStatement' ? (
            <TextArea rows={4} className="flex-1" />
          ) : (
            <div className="profile-info-item">
              {user.missionStatement || 'Not specified'}
            </div>
          )}
          {editingField === 'missionStatement'
            ? renderSaveCancelButtons('missionStatement')
            : renderEditButton('missionStatement')}
        </div>
      </Form.Item>
    </>
  );

  const renderDonorInfo = () => (
    <>
      <Divider orientation="left" className="text-[#008080]">
        <SolutionOutlined /> Donor Information
      </Divider>
      {user.role === 'organization_donor' && (
        <Form.Item label="Organization Name" name="organizationName">
          <div className="flex items-center justify-between">
            {editingField === 'organizationName' ? (
              <Input className="flex-1" />
            ) : (
              <div className="profile-info-item">
                {user.organizationName || 'Not specified'}
              </div>
            )}
            {editingField === 'organizationName'
              ? renderSaveCancelButtons('organizationName')
              : renderEditButton('organizationName')}
          </div>
        </Form.Item>
      )}
      <Form.Item label="Preferred Donation Types" name="preferredDonations">
        <div className="flex items-center justify-between">
          {editingField === 'preferredDonations' ? (
            <Select
              mode="tags"
              placeholder="Add preferred donation types"
              className="flex-1"
            >
              {['Money', 'Food', 'Clothing', 'Medical Supplies', 'Other'].map(
                (type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                )
              )}
            </Select>
          ) : (
            <div className="profile-info-item">
              {user.preferredDonations?.length > 0
                ? user.preferredDonations.map((type) => (
                    <Tag key={type} color="#008080">
                      {type}
                    </Tag>
                  ))
                : 'Not specified'}
            </div>
          )}
          {editingField === 'preferredDonations'
            ? renderSaveCancelButtons('preferredDonations')
            : renderEditButton('preferredDonations')}
        </div>
      </Form.Item>
    </>
  );

  const renderAdminInfo = () => (
    <>
      <Divider orientation="left" className="text-[#008080]">
        <SafetyOutlined /> Admin Information
      </Divider>
      <Form.Item label="Admin Level" name="adminLevel">
        <div className="profile-info-item">{user.adminLevel || 'Standard'}</div>
      </Form.Item>
      <Form.Item label="Last System Action" name="lastAction">
        <div className="profile-info-item">
          {user.lastAction || 'No recent actions'}
        </div>
      </Form.Item>
    </>
  );

  return (
    <Card bordered={false} className="profile-section shadow-md">
      <Form form={form} layout="vertical" initialValues={user}>
        {user.role === 'volunteer' && renderVolunteerInfo()}
        {user.role === 'ngo' && renderNgoInfo()}
        {(user.role === 'individual_donor' ||
          user.role === 'organization_donor') &&
          renderDonorInfo()}
        {user.role === 'admin' && renderAdminInfo()}

        <Divider orientation="left" className="text-[#008080]">
          Account Details
        </Divider>
        <div className="profile-info-item">
          <span className="font-medium">User ID:</span> {user._id}
        </div>
        <div className="profile-info-item mt-2">
          <span className="font-medium">Member Since:</span>{' '}
          {new Date(user.createdAt).toLocaleDateString()}
        </div>
        <div className="profile-info-item mt-2">
          <span className="font-medium">Last Login:</span>{' '}
          {new Date(user.lastLogin).toLocaleString()}
        </div>
      </Form>
    </Card>
  );
};

export default ProfileRoleSpecificInfo;
