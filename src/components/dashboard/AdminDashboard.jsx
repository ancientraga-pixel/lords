import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../../context/BlockchainContext';

function AdminDashboard() {
  const { invokeChaincode, queryChaincode } = useBlockchain();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvedZones, setApprovedZones] = useState([]);
  const [permittedHerbs, setPermittedHerbs] = useState([]);
  const [newZone, setNewZone] = useState({
    name: '',
    minLat: '',
    minLng: '',
    maxLat: '',
    maxLng: '',
    maxYield: 500
  });
  const [newHerb, setNewHerb] = useState({
    name: '',
    scientificName: '',
    seasonStart: '',
    seasonEnd: '',
    maxYieldPerCollection: 50,
    qualityStandards: {
      moisture: { max: 12, unit: '%' },
      pesticides: { max: 0.01, unit: 'mg/kg' },
      heavyMetals: { max: 10, unit: 'ppm' }
    }
  });
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalBatches: 0,
    totalRecalls: 0,
    networkHealth: 100
  });

  useEffect(() => {
    fetchPendingUsers();
    fetchApprovedZones();
    fetchPermittedHerbs();
    fetchSystemStats();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const response = await fetch('/api/admin/pending-users');
      if (response.ok) {
        const data = await response.json();
        setPendingUsers(data);
      }
    } catch (error) {
      console.error('Error fetching pending users:', error);
    }
  };

  const fetchApprovedZones = async () => {
    try {
      const response = await fetch('/api/admin/permitted-zones');
      if (response.ok) {
        const data = await response.json();
        setApprovedZones(data);
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  };

  const fetchPermittedHerbs = async () => {
    try {
      const response = await fetch('/api/admin/permitted-herbs');
      if (response.ok) {
        const data = await response.json();
        setPermittedHerbs(data);
      }
    } catch (error) {
      console.error('Error fetching herbs:', error);
    }
  };

  const fetchSystemStats = async () => {
    try {
      const response = await fetch('/api/admin/system-stats');
      if (response.ok) {
        const data = await response.json();
        setSystemStats(data);
      }
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  };

  const handleUserApproval = async (userId, approved) => {
    try {
      const response = await fetch(`/api/admin/approve-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, approved })
      });
      
      if (response.ok) {
        fetchPendingUsers();
        alert(`User ${approved ? 'approved' : 'rejected'} successfully`);
      }
    } catch (error) {
      console.error('Error processing user approval:', error);
    }
  };

  const handleAddZone = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/permitted-zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newZone)
      });
      
      if (response.ok) {
        setNewZone({
          name: '',
          minLat: '',
          minLng: '',
          maxLat: '',
          maxLng: '',
          maxYield: 500
        });
        fetchApprovedZones();
        alert('Zone added successfully');
      } else {
        alert('Failed to add zone');
      }
    } catch (error) {
      console.error('Error adding zone:', error);
      alert('Failed to add zone');
    }
  };

  const handleAddHerb = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/permitted-herbs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHerb)
      });
      
      if (response.ok) {
        setNewHerb({
          name: '',
          scientificName: '',
          seasonStart: '',
          seasonEnd: '',
          maxYieldPerCollection: 50,
          qualityStandards: {
            moisture: { max: 12, unit: '%' },
            pesticides: { max: 0.01, unit: 'mg/kg' },
            heavyMetals: { max: 10, unit: 'ppm' }
          }
        });
        fetchPermittedHerbs();
        alert('Herb added successfully');
      } else {
        alert('Failed to add herb');
      }
    } catch (error) {
      console.error('Error adding herb:', error);
      alert('Failed to add herb');
    }
  };

  const handleDeleteZone = async (zoneId) => {
    if (confirm('Are you sure you want to delete this zone?')) {
      try {
        const response = await fetch(`/api/admin/permitted-zones/${zoneId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          fetchApprovedZones();
          alert('Zone deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting zone:', error);
      }
    }
  };

  const handleDeleteHerb = async (herbId) => {
    if (confirm('Are you sure you want to delete this herb?')) {
      try {
        const response = await fetch(`/api/admin/permitted-herbs/${herbId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          fetchPermittedHerbs();
          alert('Herb deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting herb:', error);
      }
    }
  };

  const initiateRecall = async (batchId, reason) => {
    try {
      const result = await invokeChaincode('InitiateRecall', [
        JSON.stringify({ batchId, reason, timestamp: new Date().toISOString() })
      ]);
      
      if (result.success) {
        alert('Recall initiated successfully');
      }
    } catch (error) {
      console.error('Error initiating recall:', error);
      alert('Failed to initiate recall');
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h2>🛡️ NMPB Admin Panel</h2>
        <p>Manage users, zones, and system operations</p>
        <div className="admin-badge">
          <span>👨‍💼 Administrator Access</span>
        </div>
      </div>

      <div className="grid grid-4 mb-3">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{systemStats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-value">{systemStats.totalBatches}</div>
            <div className="stat-label">Total Batches</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-value">{systemStats.totalRecalls}</div>
            <div className="stat-label">Total Recalls</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌐</div>
          <div className="stat-content">
            <div className="stat-value">{systemStats.networkHealth}%</div>
            <div className="stat-label">Network Health</div>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3>Pending User Registrations</h3>
          {pendingUsers.length === 0 ? (
            <p>No pending registrations</p>
          ) : (
            <div className="users-list">
              {pendingUsers.map(user => (
                <div key={user.id} className="user-item">
                  <div className="user-info">
                    <div className="user-name">{user.name}</div>
                    <div className="user-role">{user.role}</div>
                    <div className="user-org">{user.organization}</div>
                    <div className="user-location">{user.location}</div>
                  </div>
                  <div className="user-actions">
                    <button 
                      className="button secondary"
                      onClick={() => handleUserApproval(user.id, true)}
                    >
                      Approve
                    </button>
                    <button 
                      className="button danger"
                      onClick={() => handleUserApproval(user.id, false)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3>Add Permitted Zone</h3>
          <form onSubmit={handleAddZone}>
            <div className="form-group">
              <label className="form-label">Zone Name</label>
              <input
                type="text"
                value={newZone.name}
                onChange={(e) => setNewZone({...newZone, name: e.target.value})}
                className="form-input"
                placeholder="e.g., Rajasthan Zone 1"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Max Yield (kg)</label>
              <input
                type="number"
                value={newZone.maxYield}
                onChange={(e) => setNewZone({...newZone, maxYield: parseInt(e.target.value)})}
                className="form-input"
                placeholder="Maximum allowed yield"
                min="100"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Minimum Latitude</label>
              <input
                type="number"
                value={newZone.minLat}
                onChange={(e) => setNewZone({...newZone, minLat: parseFloat(e.target.value)})}
                className="form-input"
                placeholder="e.g., 26.9124"
                step="0.0001"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Minimum Longitude</label>
              <input
                type="number"
                value={newZone.minLng}
                onChange={(e) => setNewZone({...newZone, minLng: parseFloat(e.target.value)})}
                className="form-input"
                placeholder="e.g., 75.7873"
                step="0.0001"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Maximum Latitude</label>
              <input
                type="number"
                value={newZone.maxLat}
                onChange={(e) => setNewZone({...newZone, maxLat: parseFloat(e.target.value)})}
                className="form-input"
                placeholder="e.g., 27.2124"
                step="0.0001"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Maximum Longitude</label>
              <input
                type="number"
                value={newZone.maxLng}
                onChange={(e) => setNewZone({...newZone, maxLng: parseFloat(e.target.value)})}
                className="form-input"
                placeholder="e.g., 76.0873"
                step="0.0001"
                required
              />
            </div>

            <button type="submit" className="button">
              Add Zone
            </button>
          </form>
        </div>

        <div className="card">
          <h3>Add Permitted Herb</h3>
          <form onSubmit={handleAddHerb}>
            <div className="form-group">
              <label className="form-label">Herb Name</label>
              <input
                type="text"
                value={newHerb.name}
                onChange={(e) => setNewHerb({...newHerb, name: e.target.value})}
                className="form-input"
                placeholder="e.g., Ashwagandha"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Scientific Name</label>
              <input
                type="text"
                value={newHerb.scientificName}
                onChange={(e) => setNewHerb({...newHerb, scientificName: e.target.value})}
                className="form-input"
                placeholder="e.g., Withania somnifera"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Season Start</label>
              <select
                value={newHerb.seasonStart}
                onChange={(e) => setNewHerb({...newHerb, seasonStart: e.target.value})}
                className="form-select"
                required
              >
                <option value="">Select Month</option>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Season End</label>
              <select
                value={newHerb.seasonEnd}
                onChange={(e) => setNewHerb({...newHerb, seasonEnd: e.target.value})}
                className="form-select"
                required
              >
                <option value="">Select Month</option>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Max Yield Per Collection (kg)</label>
              <input
                type="number"
                value={newHerb.maxYieldPerCollection}
                onChange={(e) => setNewHerb({...newHerb, maxYieldPerCollection: parseInt(e.target.value)})}
                className="form-input"
                placeholder="Maximum allowed per collection"
                min="1"
                required
              />
            </div>

            <button type="submit" className="button">
              Add Herb
            </button>
          </form>
        </div>
      </div>

      <div className="card mt-3">
        <h3>Permitted Cultivation Zones</h3>
        <div className="zones-list mb-3">
          {approvedZones.map(zone => (
            <div key={zone.id} className="zone-item">
              <div className="zone-info">
                <div className="zone-name">{zone.name}</div>
                <div className="zone-coords">
                  Lat: {zone.minLat} - {zone.maxLat}, 
                  Lng: {zone.minLng} - {zone.maxLng}
                </div>
                <div className="zone-yield">Max Yield: {zone.maxYield} kg</div>
              </div>
              <div className="zone-actions">
                <button 
                  className="button danger"
                  onClick={() => handleDeleteZone(zone.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="map-container" style={{ 
          height: '400px', 
          width: '100%',
          background: '#e8f5e8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          border: '2px solid #4CAF50'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>🗺️</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c3e50' }}>
              Approved Zones Map
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {approvedZones.length} zones configured
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-3">
        <h3>Permitted Herbs Database</h3>
        <div className="herbs-list">
          {permittedHerbs.map(herb => (
            <div key={herb.id} className="herb-item">
              <div className="herb-info">
                <div className="herb-name">{herb.name}</div>
                <div className="herb-scientific">{herb.scientificName}</div>
                <div className="herb-season">
                  Season: {herb.seasonStart} - {herb.seasonEnd}
                </div>
                <div className="herb-yield">
                  Max Collection: {herb.maxYieldPerCollection} kg
                </div>
                <div className="herb-standards">
                  Quality: Moisture &lt;{herb.qualityStandards.moisture.max}%, 
                  Pesticides &lt;{herb.qualityStandards.pesticides.max}mg/kg
                </div>
              </div>
              <div className="herb-actions">
                <button 
                  className="button danger"
                  onClick={() => handleDeleteHerb(herb.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card mt-3">
        <h3>System Operations</h3>
        <div className="operations-grid">
          <button 
            className="button danger"
            onClick={() => {
              const batchId = prompt('Enter Batch ID to recall:');
              const reason = prompt('Enter recall reason:');
              if (batchId && reason) {
                initiateRecall(batchId, reason);
              }
            }}
          >
            Initiate Product Recall
          </button>
          
          <button className="button secondary">
            Generate AYUSH Report
          </button>
          
          <button className="button secondary">
            Export System Data
          </button>
          
          <button className="button secondary">
            Blockchain Health Check
          </button>
          
          <button className="button secondary">
            SMS Gateway Status
          </button>
          
          <button className="button secondary">
            IPFS Network Status
          </button>
        </div>
      </div>

      <style jsx>{`
        .zones-list, .herbs-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .zone-item, .herb-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: rgba(248, 249, 250, 0.8);
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .zone-info, .herb-info {
          flex: 1;
        }

        .zone-name, .herb-name {
          font-weight: 600;
          color: #495057;
          margin-bottom: 4px;
        }

        .zone-coords, .zone-yield, .herb-scientific, .herb-season, .herb-yield, .herb-standards {
          font-size: 14px;
          color: #6c757d;
          margin-bottom: 2px;
        }

        .operations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;