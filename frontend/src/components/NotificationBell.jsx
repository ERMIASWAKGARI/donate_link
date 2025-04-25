import { BellOutlined, MoreOutlined } from '@ant-design/icons';
import {
  Badge,
  Button,
  Dropdown,
  List,
  Menu,
  Popover,
  Spin,
  Tabs,
  Tag,
} from 'antd';
import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

const NotificationBell = () => {
  const {
    notifications,
    markMultipleAsRead,
    unreadCount,
    isLoading,
    activeTab,
    pagination,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    changeTab,
    loadMore,
    setNotifications,
    setUnreadCount,
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const popoverRef = useRef(null);
  const navigate = useNavigate();

  // Dropdown menu for "Mark All as Read"
  const menu = (
    <Menu>
      <Menu.Item
        key="markAllAsRead"
        onClick={markAllAsRead}
        disabled={unreadCount === 0}
      >
        Mark All as Read
      </Menu.Item>
    </Menu>
  );

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
    if (newOpen && unreadCount > 0) {
      const unreadIds = notifications.filter((n) => !n.seen).map((n) => n._id);
      if (unreadIds.length > 0) {
        markMultipleAsRead(unreadIds);
      }
    }
  };

  const handleNotificationClick = useCallback(
    async (notification) => {
      if (!notification.seen && notification._id) {
        try {
          // Optimistic UI update first
          setNotifications((prev) =>
            prev.map((n) =>
              n._id === notification._id ? { ...n, seen: true } : n
            )
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));

          // Make the API call
          await markAsRead(notification._id);

          // Refetch notifications to ensure sync
          fetchNotifications(pagination.page, activeTab);
          // eslint-disable-next-line no-unused-vars
        } catch (error) {
          // Revert if API call fails
          setNotifications((prev) =>
            prev.map((n) =>
              n._id === notification._id ? { ...n, seen: false } : n
            )
          );
          setUnreadCount((prev) => prev + 1);
        }
      }
    },
    [markAsRead, fetchNotifications, pagination.page, activeTab]
  );

  // Helper function to format notification type for display
  const formatNotificationType = (type) => {
    const typeMap = {
      'donation-request': 'Donation Request',
      application: 'Application',
      need: 'Need',
      report: 'Report',
      payment: 'Payment',
      verification_docs_upload: 'Verification Docs',
      verification_status_approved: 'Account verified',
      verification_status_rejected: 'Account verification failed',
      general: 'General',
    };
    return typeMap[type] || type;
  };

  // Helper function to get tag color based on type
  const getTagColor = (type) => {
    const colorMap = {
      'donation-request': 'purple',
      application: 'orange',
      need: 'red',
      report: 'volcano',
      payment: 'green',
      verification_docs_upload: 'blue',
      verification_status_approved: 'cyan',
      verification_status_rejected: 'red',
      general: 'default',
    };
    return colorMap[type] || 'default';
  };

  const renderNotificationItem = useCallback(
    (item) => (
      <List.Item
        key={item._id}
        onClick={() => {
          handleNotificationClick(item);
          if (item.link) {
            navigate(item.link);
          }
        }}
        style={{
          cursor: 'pointer',
          backgroundColor: item.seen ? '#fff' : '#f6ffed',
          padding: '12px 16px',
          borderLeft: item.seen ? 'none' : '3px solid #52c41a',
          ':hover': {
            backgroundColor: item.link ? '#f0f7ff' : undefined,
          },
        }}
      >
        <List.Item.Meta
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ whiteSpace: 'normal' }}>{item.message}</span>
            </div>
          }
          description={
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>{new Date(item.createdAt).toLocaleString()}</div>
                <Tag color={getTagColor(item.type)}>
                  {formatNotificationType(item.type)}
                </Tag>
              </div>
              {item.link && item.type === 'verification_docs_upload' && (
                <div style={{ marginTop: 4 }}>
                  <Button
                    type="link"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(item.link);
                    }}
                    style={{
                      padding: 0,
                      height: 'auto',
                      color: '#1890ff',
                    }}
                  >
                    Review Uploaded Documents
                  </Button>
                </div>
              )}
              {item.link && item.type === 'verification_status_approved' && (
                <div style={{ marginTop: 4 }}>
                  <Button
                    type="link"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(item.link);
                    }}
                    style={{
                      padding: 0,
                      height: 'auto',
                      color: '#1890ff',
                    }}
                  >
                    Go to Profile
                  </Button>
                </div>
              )}
              {item.link && item.type === 'verification_status_rejected' && (
                <div style={{ marginTop: 4 }}>
                  <Button
                    type="link"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(item.link);
                    }}
                    style={{
                      padding: 0,
                      height: 'auto',
                      color: '#1890ff',
                    }}
                  >
                    Go to Profile
                  </Button>
                </div>
              )}
            </div>
          }
        />
      </List.Item>
    ),
    [handleNotificationClick, navigate]
  );

  const content = (
    <div
      style={{
        width: 350,
        display: 'flex',
        flexDirection: 'column',
        height: '70vh',
        maxHeight: '500px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 16px',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={changeTab}
          centered={false}
          size="small"
          style={{ flex: 1 }}
          items={[
            { label: 'All', key: 'all' },
            { label: `Unread (${unreadCount})`, key: 'unread' },
          ]}
        />

        <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
          <Button
            type="text"
            icon={<MoreOutlined />}
            style={{ marginLeft: 8 }}
            disabled={unreadCount === 0}
          />
        </Dropdown>
      </div>

      {/* Rest of your existing content... */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          loading={isLoading && pagination.page === 1}
          renderItem={renderNotificationItem}
          locale={{ emptyText: 'No notifications' }}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 8px',
          }}
        />

        <div
          style={{
            padding: '8px 0',
            borderTop: '1px solid #f0f0f0',
            background: '#fff',
          }}
        >
          {isLoading && pagination.page > 1 && (
            <div style={{ textAlign: 'center' }}>
              <Spin size="small" />
            </div>
          )}

          {pagination.hasMore && !isLoading && (
            <Button
              type="link"
              onClick={loadMore}
              style={{ width: '100%', textAlign: 'center' }}
            >
              Load More Notifications
            </Button>
          )}

          {!pagination.hasMore && notifications.length > 0 && (
            <div style={{ textAlign: 'center', color: '#888' }}>
              No more notifications
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Popover
      ref={popoverRef}
      content={content}
      title="Notifications"
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
      placement="bottomRight"
      overlayStyle={{
        width: 350,
        maxHeight: '70vh',
      }}
    >
      <Badge count={unreadCount}>
        <BellOutlined
          style={{ fontSize: 20, cursor: 'pointer', color: 'white' }}
        />
      </Badge>
    </Popover>
  );
};

export default NotificationBell;
