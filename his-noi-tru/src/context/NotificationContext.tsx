import React, { createContext, useContext, useState } from 'react';

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'INFO' | 'ACCESS' | 'SUCCESS' | 'WARNING';
  isRead: boolean;
  actionUrl?: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (n: Omit<AppNotification, 'id' | 'time' | 'isRead'>) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      title: 'Hồ sơ đã được truy cập',
      description: 'BS. CKI Trần Minh Tuấn (Bạch Mai) vừa xem bệnh án EMR-2026-0042.',
      time: '10 phút trước',
      type: 'ACCESS',
      isRead: false,
    },
    {
      id: 'notif-2',
      title: 'Yêu cầu truy cập mới',
      description: 'BS. ThS Lê Quỳnh Mai (Chợ Rẫy) gửi yêu cầu truy cập hồ sơ 7 ngày.',
      time: '45 phút trước',
      type: 'INFO',
      isRead: false,
    },
    {
      id: 'notif-3',
      title: 'Xác nhận On-chain thành công',
      description: 'Bản ghi diễn tiến điều trị #2 đã được đóng gói vào Block #19842580.',
      time: '2 giờ trước',
      type: 'SUCCESS',
      isRead: true,
    },
    {
      id: 'notif-4',
      title: 'Cảnh báo bảo mật hệ thống',
      description: 'Phát hiện dải IP ngoại mạng truy vấn vượt ngưỡng thông thường.',
      time: '5 giờ trước',
      type: 'WARNING',
      isRead: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const addNotification = (n: Omit<AppNotification, 'id' | 'time' | 'isRead'>) => {
    const newNotif: AppNotification = {
      ...n,
      id: 'notif-' + Date.now(),
      time: 'Vừa xong',
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
};
