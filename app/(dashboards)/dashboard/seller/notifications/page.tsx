"use client";

export const dynamic = 'force-dynamic'
import React from 'react';
import NotificationList from '@/app/components/AdminComponents/NotificationList';

const SellerNotificationsPage = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <NotificationList />
    </div>
  );
};

export default SellerNotificationsPage;
