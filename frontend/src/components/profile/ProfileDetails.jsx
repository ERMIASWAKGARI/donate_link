/* eslint-disable react/prop-types */
import { Card, Tabs, Typography } from 'antd';
import ProfileRoleSpecificInfo from './ProfileRoleSpecificInfo';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

const ProfileDetails = ({ user, activeTab, setActiveTab }) => {
  return (
    <Card
      bordered={false}
      className="border border-gray-200 rounded-lg shadow-sm"
    >
      <div className="flex justify-between items-center mb-4">
        <Title level={4} className="mb-0 text-[#008080]">
          Profile Details
        </Title>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        tabBarStyle={{
          color: '#008080',
          borderBottomColor: '#008080',
        }}
        inkBarStyle={{
          backgroundColor: '#008080',
        }}
      >
        <TabPane
          tab={<span className="text-[#008080]">Basic Info</span>}
          key="basic"
        >
          <ProfileRoleSpecificInfo user={user} />
        </TabPane>
        <TabPane
          tab={<span className="text-[#008080]">Activity</span>}
          key="activity"
        >
          <div className="text-center py-4">
            <Text type="secondary">User activity will appear here</Text>
          </div>
        </TabPane>
        <TabPane
          tab={<span className="text-[#008080]">Settings</span>}
          key="settings"
        >
          <div className="text-center py-4">
            <Text type="secondary">Account settings will appear here</Text>
          </div>
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default ProfileDetails;
