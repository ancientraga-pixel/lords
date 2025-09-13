import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBlockchain } from '../context/BlockchainContext';

// Role-specific components
import CollectorDashboard from '../components/dashboard/CollectorDashboard';
import LabTechDashboard from '../components/dashboard/LabTechDashboard';
import ProcessorDashboard from '../components/dashboard/ProcessorDashboard';
import ManufacturerDashboard from '../components/dashboard/ManufacturerDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';

import './Dashboard.css';

function Dashboard() {
  const { user } = useAuth();
  const { networkStatus, transactions } = useBlockchain();
  const [stats, setStats] = useState({
    totalBatches: 0,
    pendingActions: 0,
    completedTransactions: 0,
    networkHealth: 100
  });

  useEffect(() => {
    // Fetch user-specific statistics
    fetchStats();
  }, [user.role]);

  const fetchStats = async () => {
    try {
      // Mock API call to get dashboard statistics
      const response = await fetch(`/api/dashboard/stats?role=${user.role}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const renderRoleSpecificDashboard = () => {
    switch (user.role) {
      case 'Collector':
        return <CollectorDashboard />;
      case 'LabTech':
        return <LabTechDashboard />;
      case 'Processor':
        return <ProcessorDashboard />;
      case 'Manufacturer':
        return <ManufacturerDashboard />;
      case 'Admin':
        return <AdminDashboard />;
      default:
        return <div>Role not recognized</div>;
    }
  };

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome back, {user.name}</h1>
          <p>Manage your {user.role.toLowerCase()} activities in the HERBIONYX network</p>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalBatches}</div>
              <div className="stat-label">Total Batches</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-value">{stats.pendingActions}</div>
              <div className="stat-label">Pending Actions</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{stats.completedTransactions}</div>
              <div className="stat-label">Completed Transactions</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🌐</div>
            <div className="stat-content">
              <div className="stat-value">{networkStatus === 'connected' ? '100%' : '0%'}</div>
              <div className="stat-label">Network Health</div>
              <div className={`network-status ${networkStatus}`}>
                {networkStatus}
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          {renderRoleSpecificDashboard()}
        </div>

        <div className="recent-transactions">
          <div className="card">
            <h3>Recent Transactions</h3>
            {transactions.length === 0 ? (
              <p>No recent transactions</p>
            ) : (
              <div className="transaction-list">
                {transactions.slice(0, 5).map(tx => (
                  <div key={tx.id} className="transaction-item">
                    <div className="transaction-info">
                      <div className="transaction-function">{tx.function}</div>
                      <div className="transaction-time">{new Date(tx.timestamp).toLocaleString()}</div>
                    </div>
                    <div className={`transaction-status ${tx.status}`}>
                      {tx.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;