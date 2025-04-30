/* eslint-disable react/prop-types */
import { useState } from 'react';
import UserAnalytics from './UserAnalytics';
import PostAnalytics from './PostAnalytics';

const DashboardTabs = () => {
  const tabs = ['Users Analytics', 'Posts Analytics', 'Donations'];
  const [activeTab, setActiveTab] = useState('Users Analytics');

  return (
    <div className="w-full">
      {/* Tabs Header */}
      <div className="flex border-b border-gray-300 bg-teal-50 font-medium">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-5 py-2 transition-colors duration-200 ${
              activeTab === tab
                ? 'text-[#008080] border-b-2 border-[#008080] bg-teal-100 font-semibold'
                : 'text-gray-600 hover:text-[#008080]'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'Users Analytics' && <UserAnalytics />}
        {activeTab === 'Posts Analytics' && <PostAnalytics />}
        {activeTab === 'Donations' && <div>Donations content coming soon</div>}
      </div>
    </div>
  );
};

export default DashboardTabs;
