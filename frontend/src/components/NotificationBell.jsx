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

  const renderNotificationItem = useCallback(
    (item) => (
      <List.Item
        key={item._id}
        onClick={() => handleNotificationClick(item)}
        style={{
          cursor: 'pointer',
          backgroundColor: item.seen ? '#fff' : '#f6ffed',
          padding: '12px 16px',
          borderLeft: item.seen ? 'none' : '3px solid #52c41a',
        }}
      >
        <List.Item.Meta
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ whiteSpace: 'normal' }}>{item.message}</span>
              {!item.seen && <Tag color="green">New</Tag>}
            </div>
          }
          description={new Date(item.createdAt).toLocaleString()}
        />
      </List.Item>
    ),
    [handleNotificationClick]
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
        <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
      </Badge>
    </Popover>
  );
};

export default NotificationBell;
