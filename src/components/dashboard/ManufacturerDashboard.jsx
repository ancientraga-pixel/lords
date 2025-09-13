import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../../context/BlockchainContext';
import QRScanner from '../common/QRScanner';
import ImageUpload from '../common/ImageUpload';
import QRGenerator from '../common/QRGenerator';
import { Factory, Package, Calendar, Upload, RotateCcw, CheckCircle } from 'lucide-react';

function ManufacturerDashboard() {
  const { invokeChaincode, queryChaincode, uploadToIPFS } = useBlockchain();
  const [scannedData, setScannedData] = useState(null);
  const [productData, setProductData] = useState({
    productName: '',
    quantity: '',
    expiryDate: '',
    productImage: null,
    productMetadata: null
  });
  const [loading, setLoading] = useState(false);
  const [finalQR, setFinalQR] = useState(null);
  const [processedBatches, setProcessedBatches] = useState([]);

  useEffect(() => {
    fetchProcessedBatches();
  }, []);

  const fetchProcessedBatches = async () => {
    try {
      const response = await fetch('/api/manufacturer/processed-batches');
      if (response.ok) {
        const data = await response.json();
        setProcessedBatches(data);
      }
    } catch (error) {
      console.error('Error fetching processed batches:', error);
    }
  };

  const handleQRScan = async (data) => {
    try {
      const qrData = JSON.parse(data);
      if (qrData.type === 'processing') {
        const result = await queryChaincode('GetProcessingDetails', [qrData.processId]);
        if (result.success) {
          setScannedData({
            ...result.data,
            qrData
          });
        }
      } else {
        alert('Please scan a valid processing QR code');
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

      // Upload product image if provided
      if (productData.productImage) {
        const imageResult = await uploadToIPFS(productData.productImage);
        imageHash = imageResult.hash;
      }

      // Upload product metadata if provided
      if (productData.productMetadata) {
        const metadataResult = await uploadToIPFS(productData.productMetadata);
        metadataHash = metadataResult.hash;
      }

      // Create comprehensive product metadata
      const manufacturingMetadata = {
        productDetails: {
          name: productData.productName,
          quantity: parseFloat(productData.quantity),
          expiryDate: productData.expiryDate
        },
        manufacturingDate: new Date().toISOString(),
        compliance: {
          GMP: true,
          GACP: true,
          AYUSH: true,
          organic: true
        },
        manufacturer: 'Current User',
        batchNumber: `BATCH_${Date.now()}`
      };

      const metadataBlob = new Blob([JSON.stringify(manufacturingMetadata)], { type: 'application/json' });
      const metadataFile = new File([metadataBlob], 'product-metadata.json');
      const finalMetadataResult = await uploadToIPFS(metadataFile);
      metadataHash = finalMetadataResult.hash;

      // Create final product batch
      const batchData = {
        processId: scannedData.processId,
        productName: productData.productName,
        batchSize: parseFloat(productData.quantity),
        formulation: `${productData.productName} - Premium Quality`,
        expiryDate: productData.expiryDate,
        timestamp: new Date().toISOString(),
        imageHash: imageHash,
        metadataHash: metadataHash
      };

      const result = await invokeChaincode('BatchCreation', [JSON.stringify(batchData)]);
      
      if (result.success && result.qrData) {
        setFinalQR(result.qrData);

        // Reset form
        setProductData({
          productName: '',
          quantity: '',
          expiryDate: '',
          productImage: null,
          productMetadata: null
        });
        setScannedData(null);

        fetchProcessedBatches();
        alert('Final product created successfully on blockchain!');
      }
    } catch (error) {
      console.error('Error creating final product:', error);
      alert('Failed to create final product');
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    setProductData({
      ...productData,
      [e.target.name]: e.target.value
    });
  };

  const handleReset = () => {
    setProductData({
      productName: '',
      quantity: '',
      expiryDate: '',
      productImage: null,
      productMetadata: null
    });
    setScannedData(null);
    setFinalQR(null);
  };

  return (
    <div className="manufacturer-dashboard">
      {/* Main Content */}
      <div className="dashboard-section">
        <div className="section-header">
          <Factory className="section-icon" />
          <h2>Scan Processing QR</h2>
        </div>
        
        <div className="scanner-area">
          <p className="scanner-instruction">
            First, scan the QR code from the processing step to verify the processed herb.
          </p>
          <QRScanner onScan={handleQRScan} />
          
          {scannedData && (
            <div className="scanned-info">
              <h3>Processing Verified - Ready for Manufacturing</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Species:</span>
                  <span className="info-value">{scannedData.species}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Process Type:</span>
                  <span className="info-value">{scannedData.processType}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Yield:</span>
                  <span className="info-value">{scannedData.yield} kg</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Process Date:</span>
                  <span className="info-value">{new Date(scannedData.processDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Batch Details */}
      <div className="dashboard-section">
        <div className="section-header">
          <Package className="section-icon" />
          <h2>Batch Details</h2>
        </div>

        {scannedData ? (
          <form onSubmit={handleSubmit} className="batch-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input
                  type="text"
                  name="productName"
                  value={productData.productName}
                  onChange={handleChange}
                  className="form-input enhanced-input"
                  placeholder="e.g., Ashwagandha Capsules"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Quantity (units)</label>
                <input
                  type="number"
                  name="quantity"
                  value={productData.quantity}
                  onChange={handleChange}
                  className="form-input enhanced-input"
                  placeholder="e.g., 1000"
                  step="1"
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Calendar className="label-icon" />
                  Expiry Date
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={productData.expiryDate}
                  onChange={handleChange}
                  className="form-input enhanced-input"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Upload Product Image (optional)</label>
                <ImageUpload
                  onImageSelected={(image) => setProductData({...productData, productImage: image})}
                  accept="image/*"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Upload Product Metadata JSON (optional)</label>
                <ImageUpload
                  onImageSelected={(metadata) => setProductData({...productData, productMetadata: metadata})}
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
                <Package className="btn-icon" />
                {loading ? 'Creating Batch...' : 'Create Batch'}
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
            <Factory size={48} />
            <p>Please scan a processing QR code first to begin batch creation</p>
          </div>
        )}
      </div>

      {/* Final Product QR Code */}
      <div className="dashboard-section">
        <div className="section-header">
          <CheckCircle className="section-icon" />
          <h2>Final Product QR Code</h2>
        </div>
        
        <div className="qr-display-area">
          {finalQR ? (
            <div className="final-qr-container">
              <QRGenerator data={finalQR.qrCodeUrl} size={256} />
              <div className="qr-instructions">
                <h4>Consumer QR Code Generated!</h4>
                <p>This QR code contains the complete traceability information and should be printed on the product packaging for consumer verification.</p>
              </div>
            </div>
          ) : (
            <div className="qr-placeholder">
              <CheckCircle size={48} />
              <p>QR code will appear here after creating batch</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .manufacturer-dashboard {
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

        .batch-form {
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

        .final-qr-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .qr-instructions {
          text-align: center;
          max-width: 400px;
        }

        .qr-instructions h4 {
          color: var(--primary-green);
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .qr-instructions p {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
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

export default ManufacturerDashboard;