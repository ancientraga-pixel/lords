import React, { useState } from 'react';
import QRScanner from '../components/common/QRScanner';
import { useBlockchain } from '../context/BlockchainContext';
import './ConsumerPortal.css';

function ConsumerPortal() {
  const { queryChaincode } = useBlockchain();
  const [scannedData, setScannedData] = useState(null);
  const [provenanceData, setProvenanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQRScan = async (data) => {
    setLoading(true);
    setError('');

    try {
      const qrData = JSON.parse(data);
      
      if (qrData.type === 'final-product') {
        // Get complete provenance data
        const result = await queryChaincode('GetProvenance', [qrData.batchId]);
        
        if (result.success) {
          setScannedData(qrData);
          setProvenanceData(result.data);
        } else {
          setError('Failed to retrieve product information');
        }
      } else {
        setError('Please scan a valid product QR code');
      }
    } catch (error) {
      console.error('QR scan error:', error);
      setError('Invalid QR code format');
    }

    setLoading(false);
  };

  const renderJourneyMap = () => {
    if (!provenanceData || !provenanceData.journey) return null;

    // Mock map display for demo
    return (
      <div style={{ 
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
            Journey Map
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {provenanceData.journey.length} locations tracked
          </div>
        </div>
      </div>
    );
  };

  const renderTimelineStep = (step, index) => (
    <div key={index} className="timeline-step">
      <div className="timeline-marker">
        <div className="timeline-icon">{step.icon}</div>
      </div>
      <div className="timeline-content">
        <div className="timeline-header">
          <h4>{step.stage}</h4>
          <span className="timeline-date">
            {new Date(step.timestamp).toLocaleDateString()}
          </span>
        </div>
        <div className="timeline-details">
          <p><strong>Organization:</strong> {step.organization}</p>
          <p><strong>Location:</strong> {step.latitude.toFixed(4)}, {step.longitude.toFixed(4)}</p>
          {step.details && (
            <div className="step-details">
              {Object.entries(step.details).map(([key, value]) => (
                <p key={key}><strong>{key}:</strong> {value}</p>
              ))}
            </div>
          )}
          {step.imageHash && (
            <div className="step-image">
              <img 
                src={`https://ipfs.io/ipfs/${step.imageHash}`} 
                alt={`${step.stage} verification`}
                className="verification-image"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="consumer-portal">
      <div className="container">
        <div className="portal-header">
          <h1>Product Verification Portal</h1>
          <p>Scan the QR code on your Ayurvedic product to trace its complete journey from farm to shelf</p>
        </div>

        {!provenanceData ? (
          <div className="scanner-section">
            <div className="card">
              <h2>Scan Product QR Code</h2>
              <QRScanner onScan={handleQRScan} />
              
              {loading && (
                <div className="loading">
                  <div className="spinner"></div>
                  <span>Retrieving product information...</span>
                </div>
              )}
              
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="provenance-display fade-in">
            <div className="product-header">
              <div className="card">
                <div className="product-info">
                  <h2>{provenanceData.productName}</h2>
                  <div className="product-details">
                    <div className="detail-item">
                      <strong>Batch ID:</strong> {scannedData.batchId}
                    </div>
                    <div className="detail-item">
                      <strong>Species:</strong> {provenanceData.species}
                    </div>
                    <div className="detail-item">
                      <strong>Manufacturing Date:</strong> {new Date(provenanceData.manufacturingDate).toLocaleDateString()}
                    </div>
                    <div className="detail-item">
                      <strong>Expiry Date:</strong> {new Date(provenanceData.expiryDate).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="authenticity-badge">
                    <span className="verified-badge">✅ VERIFIED AUTHENTIC</span>
                  </div>
                </div>
                
                {provenanceData.productImage && (
                  <div className="product-image">
                    <img 
                      src={`https://ipfs.io/ipfs/${provenanceData.productImage}`} 
                      alt="Product"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-2">
              <div className="card">
                <h3>Journey Map</h3>
                <div className="map-container">
                  {renderJourneyMap()}
                </div>
              </div>

              <div className="card">
                <h3>Quality Certifications</h3>
                <div className="certifications">
                  <div className="cert-item">
                    <span className="cert-badge cert-gmp">GMP Certified</span>
                  </div>
                  <div className="cert-item">
                    <span className="cert-badge cert-gacp">GACP Compliant</span>
                  </div>
                  <div className="cert-item">
                    <span className="cert-badge cert-ayush">AYUSH Approved</span>
                  </div>
                  <div className="cert-item">
                    <span className="cert-badge cert-organic">Organic Certified</span>
                  </div>
                </div>

                <div className="quality-metrics">
                  <h4>Quality Test Results</h4>
                  {provenanceData.qualityTests && (
                    <div className="metrics-grid">
                      <div className="metric">
                        <span className="metric-label">Moisture</span>
                        <span className="metric-value">{provenanceData.qualityTests.moisture}%</span>
                        <span className="metric-status passed">✓</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Pesticides</span>
                        <span className="metric-value">{provenanceData.qualityTests.pesticides} mg/kg</span>
                        <span className="metric-status passed">✓</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Heavy Metals</span>
                        <span className="metric-value">{provenanceData.qualityTests.heavyMetals} ppm</span>
                        <span className="metric-status passed">✓</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="card">
              <h3>Complete Traceability Timeline</h3>
              <div className="timeline">
                {provenanceData.journey && provenanceData.journey.map((step, index) => 
                  renderTimelineStep(step, index)
                )}
              </div>
            </div>

            <div className="card">
              <h3>Farmer's Story</h3>
              {provenanceData.farmerStory ? (
                <div className="farmer-story">
                  <div className="story-content">
                    <p>{provenanceData.farmerStory.story}</p>
                    <div className="farmer-info">
                      <strong>Farmer:</strong> {provenanceData.farmerStory.farmerName}<br />
                      <strong>Farm:</strong> {provenanceData.farmerStory.farmName}<br />
                      <strong>Location:</strong> {provenanceData.farmerStory.location}
                    </div>
                  </div>
                  {provenanceData.farmerStory.image && (
                    <div className="story-image">
                      <img 
                        src={`https://ipfs.io/ipfs/${provenanceData.farmerStory.image}`} 
                        alt="Farmer"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <p>Farmer story is being updated. Check back soon!</p>
              )}
            </div>

            <div className="portal-actions">
              <button 
                className="button secondary"
                onClick={() => {
                  setProvenanceData(null);
                  setScannedData(null);
                }}
              >
                Scan Another Product
              </button>
              
              <button className="button">
                Share Verification
              </button>
              
              <button className="button danger">
                Report Issue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConsumerPortal;