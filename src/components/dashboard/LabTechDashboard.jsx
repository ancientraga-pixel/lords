import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../../context/BlockchainContext';
import QRScanner from '../common/QRScanner';
import ImageUpload from '../common/ImageUpload';
import QRGenerator from '../common/QRGenerator';
import { Microscope, TestTube, Camera, Upload, RotateCcw, CheckCircle } from 'lucide-react';

function LabTechDashboard() {
  const { invokeChaincode, queryChaincode, uploadToIPFS } = useBlockchain();
  const [scannedData, setScannedData] = useState(null);
  const [testData, setTestData] = useState({
    moistureContent: '',
    purity: '',
    pesticideLevel: '',
    notes: '',
    testImage: null,
    testMetadata: null,
    passed: false
  });
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [pendingBatches, setPendingBatches] = useState([]);

  useEffect(() => {
    fetchPendingBatches();
  }, []);

  const fetchPendingBatches = async () => {
    try {
      const response = await fetch('/api/lab/pending-batches');
      if (response.ok) {
        const data = await response.json();
        setPendingBatches(data);
      }
    } catch (error) {
      console.error('Error fetching pending batches:', error);
    }
  };

  const handleQRScan = async (data) => {
    try {
      const qrData = JSON.parse(data);
      if (qrData.type === 'collection') {
        const result = await queryChaincode('GetCollectionEvent', [qrData.eventId]);
        if (result.success) {
          setScannedData({
            ...result.data,
            qrData
          });
        }
      }
    } catch (error) {
      console.error('Error processing QR scan:', error);
      alert('Invalid QR code');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageHash = null;
      let metadataHash = null;

      // Upload test image if provided
      if (testData.testImage) {
        const imageResult = await uploadToIPFS(testData.testImage);
        imageHash = imageResult.hash;
      }

      // Upload test metadata if provided
      if (testData.testMetadata) {
        const metadataResult = await uploadToIPFS(testData.testMetadata);
        metadataHash = metadataResult.hash;
      }

      // Create comprehensive test metadata
      const qualityMetadata = {
        testResults: {
          moistureContent: parseFloat(testData.moistureContent),
          purity: parseFloat(testData.purity),
          pesticideLevel: parseFloat(testData.pesticideLevel)
        },
        labNotes: testData.notes,
        testDate: new Date().toISOString(),
        passed: testData.passed,
        standards: {
          moistureLimit: 12,
          purityMinimum: 95,
          pesticideLimit: 0.01
        },
        labTechnician: 'Current User',
        equipment: 'Standard Lab Equipment'
      };

      const metadataBlob = new Blob([JSON.stringify(qualityMetadata)], { type: 'application/json' });
      const metadataFile = new File([metadataBlob], 'quality-test-metadata.json');
      const finalMetadataResult = await uploadToIPFS(metadataFile);
      metadataHash = finalMetadataResult.hash;

      // Record quality attestation on blockchain
      const attestationData = {
        eventId: scannedData.eventId,
        testResults: qualityMetadata.testResults,
        passed: testData.passed,
        timestamp: new Date().toISOString(),
        imageHash: imageHash,
        metadataHash: metadataHash
      };

      const result = await invokeChaincode('QualityAttestation', [JSON.stringify(attestationData)]);
      
      if (result.success && result.qrData) {
        setQrCode(result.qrData);

        // Reset form
        setTestData({
          moistureContent: '',
          purity: '',
          pesticideLevel: '',
          notes: '',
          testImage: null,
          testMetadata: null,
          passed: false
        });
        setScannedData(null);

        fetchPendingBatches();
        alert('Quality attestation recorded successfully on blockchain!');
      }
    } catch (error) {
      console.error('Error recording attestation:', error);
      alert('Failed to record quality attestation');
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setTestData({
      ...testData,
      [e.target.name]: value
    });
  };

  const handleReset = () => {
    setTestData({
      moistureContent: '',
      purity: '',
      pesticideLevel: '',
      notes: '',
      testImage: null,
      testMetadata: null,
      passed: false
    });
    setScannedData(null);
    setQrCode(null);
  };

  // Auto-determine if batch passed based on test results
  useEffect(() => {
    if (testData.moistureContent && testData.purity && testData.pesticideLevel) {
      const passed = 
        parseFloat(testData.moistureContent) <= 12 &&
        parseFloat(testData.purity) >= 95 &&
        parseFloat(testData.pesticideLevel) <= 0.01;
      
      setTestData(prev => ({ ...prev, passed }));
    }
  }, [testData.moistureContent, testData.purity, testData.pesticideLevel]);

  return (
    <div className="labtech-dashboard">
      {/* Main Content */}
      <div className="dashboard-section">
        <div className="section-header">
          <Microscope className="section-icon" />
          <h2>Scan Collection QR</h2>
        </div>
        
        <div className="scanner-area">
          <p className="scanner-instruction">
            First, scan the QR code from the collection event to verify the herb source.
          </p>
          <QRScanner onScan={handleQRScan} />
          
          {scannedData && (
            <div className="scanned-info">
              <h3>Collection Details Verified</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Species:</span>
                  <span className="info-value">{scannedData.species}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Weight:</span>
                  <span className="info-value">{scannedData.weight} kg</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Collected:</span>
                  <span className="info-value">{new Date(scannedData.timestamp).toLocaleDateString()}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Location:</span>
                  <span className="info-value">
                    {scannedData.latitude?.toFixed(4)}, {scannedData.longitude?.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quality Test Results */}
      <div className="dashboard-section">
        <div className="section-header">
          <TestTube className="section-icon" />
          <h2>Quality Test Results</h2>
        </div>

        {scannedData ? (
          <form onSubmit={handleSubmit} className="quality-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Moisture Content (%)</label>
                <input
                  type="number"
                  name="moistureContent"
                  value={testData.moistureContent}
                  onChange={handleChange}
                  className="form-input enhanced-input"
                  placeholder="e.g., 10.5"
                  step="0.1"
                  max="100"
                  required
                />
                <small className="form-hint">Should be less than 12%</small>
              </div>

              <div className="form-group">
                <label className="form-label">Purity (%)</label>
                <input
                  type="number"
                  name="purity"
                  value={testData.purity}
                  onChange={handleChange}
                  className="form-input enhanced-input"
                  placeholder="e.g., 98.7"
                  step="0.1"
                  max="100"
                  required
                />
                <small className="form-hint">Should be more than 95%</small>
              </div>

              <div className="form-group">
                <label className="form-label">Pesticide Level (mg/kg)</label>
                <input
                  type="number"
                  name="pesticideLevel"
                  value={testData.pesticideLevel}
                  onChange={handleChange}
                  className="form-input enhanced-input"
                  placeholder="e.g., 0.005"
                  step="0.001"
                  required
                />
                <small className="form-hint">Should be less than 0.01 mg/kg</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Upload Test Image (optional)</label>
                <ImageUpload
                  onImageSelected={(image) => setTestData({...testData, testImage: image})}
                  accept="image/*"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Upload Test Metadata JSON (optional)</label>
                <ImageUpload
                  onImageSelected={(metadata) => setTestData({...testData, testMetadata: metadata})}
                  accept=".json"
                />
              </div>
            </div>

            <div className="test-status-section">
              <div className={`test-result ${testData.passed ? 'passed' : 'failed'}`}>
                {testData.passed ? (
                  <>
                    <CheckCircle className="result-icon" />
                    <span>Test Results: PASSED</span>
                  </>
                ) : (
                  <>
                    <TestTube className="result-icon" />
                    <span>Test Results: FAILED</span>
                  </>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary enhanced-btn"
                disabled={loading}
              >
                <CheckCircle className="btn-icon" />
                {loading ? 'Recording Test Results...' : 'Record Test Results'}
              </button>
              
              <button
                type="button"
                onClick={handleReset}
                className="btn-secondary enhanced-btn"
              >
                <RotateCcw className="btn-icon" />
                Reset
              </button>
            </div>
          </form>
        ) : (
          <div className="empty-state">
            <Microscope size={48} />
            <p>Please scan a collection QR code first to begin quality testing</p>
          </div>
        )}
      </div>

      {/* Quality Attestation QR Code */}
      <div className="dashboard-section">
        <div className="section-header">
          <Camera className="section-icon" />
          <h2>Quality Attestation QR Code</h2>
        </div>
        
        <div className="qr-display-area">
          {qrCode ? (
            <QRGenerator data={qrCode.qrCodeUrl} size={256} />
          ) : (
            <div className="qr-placeholder">
              <Camera size={48} />
              <p>QR code will appear here after recording quality test results</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .labtech-dashboard {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-section {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid #e5e7eb;
        }

        .section-icon {
          color: var(--primary-green);
          width: 24px;
          height: 24px;
        }

        .section-header h2 {
          color: var(--primary-green);
          font-size: 20px;
          font-weight: 600;
          margin: 0;
        }

        .scanner-area {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .scanner-instruction {
          color: #6b7280;
          font-size: 16px;
          text-align: center;
          margin-bottom: 10px;
        }

        .scanned-info {
          background: #f0fdf4;
          border: 2px solid #22c55e;
          border-radius: 12px;
          padding: 20px;
          margin-top: 20px;
        }

        .scanned-info h3 {
          color: #15803d;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #dcfce7;
        }

        .info-label {
          color: #374151;
          font-weight: 500;
        }

        .info-value {
          color: #15803d;
          font-weight: 600;
        }

        .quality-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-weight: 600;
          color: var(--primary-green);
          font-size: 14px;
        }

        .enhanced-input {
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.3s ease;
          background: white;
        }

        .enhanced-input:focus {
          outline: none;
          border-color: var(--accent-green);
          box-shadow: 0 0 0 3px rgba(107, 142, 35, 0.1);
        }

        .form-hint {
          color: #6b7280;
          font-size: 12px;
          font-style: italic;
        }

        .test-status-section {
          display: flex;
          justify-content: center;
          margin: 20px 0;
        }

        .test-result {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 24px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 18px;
        }

        .test-result.passed {
          background: #dcfce7;
          color: #166534;
          border: 2px solid #22c55e;
        }

        .test-result.failed {
          background: #fef2f2;
          color: #dc2626;
          border: 2px solid #ef4444;
        }

        .result-icon {
          width: 24px;
          height: 24px;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-start;
          margin-top: 20px;
        }

        .enhanced-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--accent-green), var(--forest-green));
          color: white;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, var(--forest-green), var(--accent-green));
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(107, 142, 35, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: 2px solid #e5e7eb;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
          transform: translateY(-2px);
        }

        .btn-icon {
          width: 18px;
          height: 18px;
        }

        .qr-display-area {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 300px;
        }

        .qr-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          color: #6b7280;
          text-align: center;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 60px;
          color: #6b7280;
          text-align: center;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

export default LabTechDashboard;