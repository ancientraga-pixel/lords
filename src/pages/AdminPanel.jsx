import React from 'react';
import AdminDashboard from '../components/dashboard/AdminDashboard';

function AdminPanel() {
  return (
    <div className="admin-panel">
      <div className="container">
        <AdminDashboard />
      </div>
    </div>
  );
}

export default AdminPanel;