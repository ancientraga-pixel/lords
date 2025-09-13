import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../../context/BlockchainContext';
import QRScanner from '../common/QRScanner';
import ImageUpload from '../common/ImageUpload';
import QRGenerator from '../common/QRGenerator';
import { Settings, Thermometer, Clock, Upload, RotateCcw, CheckCircle } from 'lucide-react';

function ProcessorDashboard() {
  const { invokeChaincode, queryChaincode, uploadToIPFS } = useBlockchain();
  const [scannedData, setScannedData] = useState(null);
  const [processData, setProcessData] = useState({
    processingMethod: '',
    yield: '',
    temperature: '',
    processImage: null,
    processMetadata: null
  });
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [approvedBatches, setApprovedBatches] = useState([]);

  useEffect(() => {
    fetchApprovedBatches();
  }, []);

  const fetchApprovedBatches = async () => {
    try {
      const response = await fetch('/api/processor/approved-batches');
      if (response.ok) {
        const data = await response.json();
        setApprovedBatches(data);
      }
    } catch (error) {
      console.error('Error fetching approved batches:', error);
    }
  };

  const handleQRScan = async (data) => {
    try {
      const qrData = JSON.parse(data);
      if (qrData.type === 'quality' && qrData.passed) {
        const result = await queryChaincode('GetQualityTest', [qrData.testId]);
        if (result.success) {
          setScannedData({
            ...result.data,
            qrData
          });
        }
      } else if (qrData.type === 'quality' && !qrData.passed) {
        alert('This batch failed quality tests and cannot be processed');
      } else {
        alert('Please scan a valid quality attestation QR code');
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

      // Upload processing image if provided
      if (processData.processImage) {
        const imageResult = await uploadToIPFS(processData.processImage);
        imageHash = imageResult.hash;
      }

      // Upload processing metadata if provided
      if (processData.processMetadata) {
        const metadataResult = await uploadToIPFS(processData.processMetadata);
        metadataHash = metadataResult.hash;
      }

      // Create comprehensive processing metadata
      const processingMetadata = {
        processingDetails: {
          method: processData.processingMethod,
          yield: parseFloat(processData.yield),
          temperature: parseFloat(processData.temperature)
        },
        processDate: new Date().toISOString(),
        equipment: 'Standard Processing Equipment',
        qualityMaintained: true,
        processor: 'Current User'
      };

      const metadataBlob = new Blob([JSON.stringify(processingMetadata)], { type: 'application/json' });
      const metadataFile = new File([metadataBlob], 'processing-metadata.json');
      const finalMetadataResult = await uploadToIPFS(metadataFile);
      metadataHash = finalMetadataResult.hash;

      // Record processing on blockchain
      const custodyData = {
        testId: scannedData.testId,
        processType: processData.processingMethod,
        temperature: parseFloat(processData.temperature),
        duration: 24, // Default duration
        yield: parseFloat(processData.yield),
        timestamp: new Date().toISOString(),
        imageHash: imageHash,
        metadataHash: metadataHash
      };

      const result = await invokeChaincode('TransferCustody', [JSON.stringify(custodyData)]);
      
      if (result.success && result.qrData) {
        setQrCode(result.qrData);

        // Reset form
        setProcessData({
          processingMethod: '',
          yield: '',
          temperature: '',
          processImage: null,
          processMetadata: null
        });
        setScannedData(null);

        fetchApprovedBatches();
        alert('Processing recorded successfully on blockchain!');
      }
    } catch (error) {
      console.error('Error recording processing:', error);
      alert('Failed to record processing');
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    setProcessData({
      ...processData,
      [e.target.name]: e.target.value
    });
  };

  const handleReset = () => {
    setProcessData({
      processingMethod: '',
      yield: '',
      temperature: '',
      processImage: null,
      processMetadata: null
    });
    setScannedData(null);
    setQrCode(null);
  };

  const processingMethods = [
    'Drying',
    'Grinding',
    'Extraction',
    'Purification',
    'Steam Distillation',
    'Cold Pressing'
  ];

  return (
    <div className="processor-dashboard">
      {/* Main Content */}
      <div className="dashboard-section">
        <div className="section-header">
          <Settings className="section-icon" />
          <h2>Scan Quality Attestation QR</h2>
        </div>
        
        <div className="scanner-area">
          <p className="scanner-instruction">
            First, scan the QR code from the quality attestation to verify the herb quality.
          </p>
          <QRScanner onScan={handleQRScan} />
          
          {scannedData && (
            <div className="scanned-info">
              <h3>Quality Verified - Ready for Processing</h3>
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
                  <span className="info-label">Quality Status:</span>
                  <span className="status-badge status-passed">PASSED</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Test Date:</span>
                  <span className="info-value">{new Date(scannedData.testDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Processing Details */}
      <div className="dashboard-section">
        <div className="section-header">
          <Settings className="section-icon" />
          <h2>Processing Details</h2>
        </div>

        {scannedData ? (
          <form onSubmit={handleSubmit} className="processing-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Processing Method</label>
                <select
                  name="processingMethod"
                  value={processData.processingMethod}
                  onChange={handleChange}
                  className="form-select enhanced-select"
                  required
                >
                  <option value="">Select Method</option>
                  {processingMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Thermometer className="label-icon" />
                  Temperature (°C)
                </label>
                <input
                  type="number"
                  name="temperature"
                  value={processData.temperature}
                  onChange={handleChange}
                  className="form-input enhanced-input"
                  placeholder="e.g., 60.0"
                  step="0.1"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Yield (grams)</label>
                <input
                  type="number"
                  name="yield"
                  value={processData.yield}
                  onChange={handleChange}
                  className="form-input enhanced-input"
                  placeholder="e.g., 250"
                  step="1"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Upload Process Image (optional)</label>
                <ImageUpload
                  onImageSelected={(image) => setProcessData({...processData, processImage: image})}
                  accept="image/*"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Upload Process Metadata JSON (optional)</label>
                <ImageUpload
                  onImageSelected={(metadata) => setProcessData({...processData, processMetadata: metadata})}
                  accept=".json"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary enhanced-btn"
                disabled={loading}
              >
                <Settings className="btn-icon" />
                {loading ? 'Recording Processing...' : 'Record Processing'}
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
            <Settings size={48} />
            <p>Please scan a quality attestation QR code first to begin processing</p>
          </div>
        )}
      </div>

      {/* Processing QR Code */}
      <div className="dashboard-section">
        <div className="section-header">
          <CheckCircle className="section-icon" />
          <h2>Processing QR Code</h2>
        </div>
        
        <div className="qr-display-area">
          {qrCode ? (
            <QRGenerator data={qrCode.qrCodeUrl} size={256} />
          ) : (
            <div className="qr-placeholder">
              <CheckCircle size={48} />
              <p>QR code will appear here after recording processing details</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .processor-dashboard {
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

        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-passed {
          background: #dcfce7;
          color: #166534;
        }

        .processing-form {
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
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          color: var(--primary-green);
          font-size: 14px;
        }

        .label-icon {
          width: 16px;
          height: 16px;
        }

        .enhanced-select,
        .enhanced-input {
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.3s ease;
          background: white;
        }

        .enhanced-select:focus,
        .enhanced-input:focus {
          outline: none;
          border-color: var(--accent-green);
          box-shadow: 0 0 0 3px rgba(107, 142, 35, 0.1);
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

export default ProcessorDashboard;