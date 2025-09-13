import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../../context/BlockchainContext';
import GeolocationInput from '../common/GeolocationInput';
import ImageUpload from '../common/ImageUpload';
import QRGenerator from '../common/QRGenerator';
import { Camera, MapPin, Package, Upload, RotateCcw } from 'lucide-react';

function CollectorDashboard() {
  const { invokeChaincode, uploadToIPFS } = useBlockchain();
  const [formData, setFormData] = useState({
    species: '',
    weight: '',
    location: null,
    notes: '',
    image: null,
    metadata: null
  });
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [batches, setBatches] = useState([]);
  const [smsTransactions, setSmsTransactions] = useState([]);

  useEffect(() => {
    fetchBatches();
    fetchSmsTransactions();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/collector/batches');
      if (response.ok) {
        const data = await response.json();
        setBatches(data);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const fetchSmsTransactions = async () => {
    try {
      const response = await fetch('/api/sms/transactions');
      if (response.ok) {
        const data = await response.json();
        setSmsTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching SMS transactions:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageHash = null;
      let metadataHash = null;

      // Upload image to IPFS if provided
      if (formData.image) {
        const imageResult = await uploadToIPFS(formData.image);
        imageHash = imageResult.hash;
      }

      // Upload metadata to IPFS if provided
      if (formData.metadata) {
        const metadataResult = await uploadToIPFS(formData.metadata);
        metadataHash = metadataResult.hash;
      }

      // Create comprehensive metadata
      const collectionMetadata = {
        collectorNotes: formData.notes,
        collectionDate: new Date().toISOString(),
        species: formData.species,
        estimatedWeight: formData.weight,
        gpsCoordinates: formData.location,
        source: 'web_interface',
        additionalData: formData.metadata
      };

      const metadataBlob = new Blob([JSON.stringify(collectionMetadata)], { type: 'application/json' });
      const metadataFile = new File([metadataBlob], 'collection-metadata.json');
      const finalMetadataResult = await uploadToIPFS(metadataFile);
      metadataHash = finalMetadataResult.hash;

      // Record collection event on blockchain
      const eventData = {
        species: formData.species,
        weight: parseFloat(formData.weight),
        latitude: formData.location.lat,
        longitude: formData.location.lng,
        timestamp: new Date().toISOString(),
        imageHash: imageHash,
        metadataHash: metadataHash,
        source: 'web_interface'
      };

      const result = await invokeChaincode('RecordCollectionEvent', [JSON.stringify(eventData)]);
      
      if (result.success && result.qrData) {
        setQrCode(result.qrData);

        // Reset form
        setFormData({
          species: '',
          weight: '',
          location: null,
          notes: '',
          image: null,
          metadata: null
        });

        fetchBatches();
        alert('Collection event recorded successfully on blockchain!');
      }
    } catch (error) {
      console.error('Error recording collection:', error);
      alert('Failed to record collection event');
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleReset = () => {
    setFormData({
      species: '',
      weight: '',
      location: null,
      notes: '',
      image: null,
      metadata: null
    });
    setQrCode(null);
  };

  const species = [
    'Talispatra', 'Chirmati', 'Katha', 'Vatsnabh', 'Atees', 'Vach', 'Adusa', 'Beal', 'Shirish', 'Ghritkumari',
    'Smaller Galanga', 'Greater Galanga', 'Satvin', 'Silarasa', 'Akarkara', 'Kalmegh', 'Agar', 'Artemisia', 'Shatavari', 'Atropa',
    'Neem', 'Brahmi', 'Daruhaldi', 'Pashnabheda', 'Punarnava', 'Patang', 'Senna', 'Sadabahar', 'Malkangani', 'Mandookparni',
    'ShwetMusali', 'Tezpatta', 'Dalchini', 'Kapoor', 'Arni', 'Aparajita', 'Pather Chur', 'Hrivera', 'Guggal', 'Shankhpushpi',
    'Mamira', 'Peela Chandan', 'Varun', 'Krsnasariva', 'Kali Musali', 'Tikhur', 'Nannari', 'Salampanja', 'Sarivan', 'Foxglove',
    'Rotalu', 'Bringaraj', 'Vai Vidang', 'Amla', 'Somlata', 'Hing', 'Kokum', 'Trayamana', 'Ginkgo', 'Kalihari',
    'Mulethi', 'Gambhari', 'Gudmar', 'Kapurkachari', 'Anantmool', 'Seabuckthorn', 'Kutaj', 'Khurasaniajwane', 'Pushkarmool', 'Giant potato',
    'Vrddhadaruka', 'Trivrit', 'Hapushal', 'Dhoop', 'Indian crocus', 'Chandrasur', 'Jivanti', 'Listea', 'Ghanera', 'Nagakeshar',
    'Sahjan', 'Konch', 'Jatamansi', 'Tulsi', 'Ratanjot', 'Syonaka', 'Ginseng', 'Bhumi amlaki', 'Kutki', 'Kababchini',
    'Pippali', 'Isabgol', 'Rasna', 'Leadwort', 'Chitrak', 'Bankakri', 'Mahameda', 'Agnimanth', 'Moovila', 'Bakuchi',
    'Beejasar', 'Raktachandan', 'Vidarikand', 'Sarpgandha', 'Archa', 'Manjishtha', 'Saptachakra', 'Chandan', 'Ashok', 'Kuth',
    'Flannel weed', 'Hrddhatri', 'Katheli-badhi', 'Makoy', 'Patala', 'Madhukari', 'Chirata', 'Lodh', 'Rohitak', 'Thuner',
    'Sharapunkha', 'Arjuna', 'Behera', 'Harad', 'Giloe', 'Barhanta', 'Patolpanchang', 'Jeevani', 'Damabooti', 'Prishnaparni',
    'Tagar-ganth', 'Indian Valerian', 'Mandadhupa', 'Khas-khas grass', 'Bunafsha', 'Nirgundi', 'Ashwagandha', 'Dhataki', 'Timoor'
  ];

  return (
    <div className="collector-dashboard">
      {/* Success Message */}
      <div className="success-banner">
        <div className="success-icon">✓</div>
        <span>Login successful!</span>
        <button className="close-banner">×</button>
      </div>

      {/* Main Content */}
      <div className="dashboard-section">
        <div className="section-header">
          <Package className="section-icon" />
          <h2>Collection Data Entry</h2>
        </div>

        <form onSubmit={handleSubmit} className="collection-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Herb Species</label>
              <select
                name="species"
                value={formData.species}
                onChange={handleChange}
                className="form-select enhanced-select"
                required
              >
                <option value="">Select Species</option>
                {species.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Weight (grams)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="form-input enhanced-input"
                placeholder="Enter weight in grams"
                step="1"
                min="1"
                required
              />
            </div>
          </div>

          <div className="form-group location-group">
            <label className="form-label">
              <MapPin className="label-icon" />
              Current Location
            </label>
            <GeolocationInput
              onLocationUpdate={(location) => setFormData({...formData, location})}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Upload Image (optional)</label>
              <ImageUpload
                onImageSelected={(image) => setFormData({...formData, image})}
                accept="image/*"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Upload Metadata JSON (optional)</label>
              <ImageUpload
                onImageSelected={(metadata) => setFormData({...formData, metadata})}
                accept=".json"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary enhanced-btn"
              disabled={loading || !formData.location}
            >
              <Package className="btn-icon" />
              {loading ? 'Recording Collection...' : 'Record Collection'}
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
      </div>

      {/* Generated QR Code Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <Camera className="section-icon" />
          <h2>Generated QR Code</h2>
        </div>
        
        <div className="qr-display-area">
          {qrCode ? (
            <QRGenerator data={qrCode.qrCodeUrl} size={256} />
          ) : (
            <div className="qr-placeholder">
              <Camera size={48} />
              <p>QR code will appear here after recording collection data</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Transactions</h2>
        </div>
        
        <div className="transactions-container">
          {/* Web Transactions */}
          <div className="transaction-group">
            <h3>Web Interface Collections</h3>
            {batches.length === 0 ? (
              <div className="empty-state">
                <Package size={32} />
                <p>No collections recorded yet</p>
              </div>
            ) : (
              <div className="transactions-list">
                {batches.map(batch => (
                  <div key={batch.id} className="transaction-card">
                    <div className="transaction-header">
                      <div className="transaction-type">Web Collection</div>
                      <div className="transaction-time">
                        {new Date(batch.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="transaction-details">
                      <div className="detail-item">
                        <span className="detail-label">Species:</span>
                        <span className="detail-value">{batch.species}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Weight:</span>
                        <span className="detail-value">{batch.weight} kg</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Location:</span>
                        <span className="detail-value">
                          {batch.latitude?.toFixed(4)}, {batch.longitude?.toFixed(4)}
                        </span>
                      </div>
                    </div>
                    <div className="transaction-status">
                      <span className={`status-badge status-${batch.status?.toLowerCase()}`}>
                        {batch.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SMS Transactions */}
          <div className="transaction-group">
            <h3>SMS Collections</h3>
            {smsTransactions.length === 0 ? (
              <div className="empty-state">
                <Package size={32} />
                <p>No SMS collections received yet</p>
              </div>
            ) : (
              <div className="transactions-list">
                {smsTransactions.map(sms => (
                  <div key={sms.id} className="transaction-card sms-transaction">
                    <div className="transaction-header">
                      <div className="transaction-type">SMS Collection</div>
                      <div className="transaction-time">
                        {new Date(sms.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="transaction-details">
                      <div className="detail-item">
                        <span className="detail-label">Phone:</span>
                        <span className="detail-value">{sms.phoneNumber}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Species:</span>
                        <span className="detail-value">{sms.species}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Weight:</span>
                        <span className="detail-value">{sms.weight} kg</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Location:</span>
                        <span className="detail-value">
                          {sms.latitude?.toFixed(4)}, {sms.longitude?.toFixed(4)}
                        </span>
                      </div>
                    </div>
                    <div className="transaction-status">
                      <span className="status-badge status-processed">
                        SMS Processed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .collector-dashboard {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .success-banner {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .success-icon {
          width: 20px;
          height: 20px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .close-banner {
          margin-left: auto;
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
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

        .collection-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .location-group {
          grid-column: 1 / -1;
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

        .transactions-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .transaction-group h3 {
          color: var(--primary-green);
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e5e7eb;
        }

        .transactions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .transaction-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          transition: all 0.3s ease;
        }

        .transaction-card:hover {
          background: #f3f4f6;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .sms-transaction {
          border-left: 4px solid #3b82f6;
        }

        .transaction-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .transaction-type {
          font-weight: 600;
          color: var(--primary-green);
          font-size: 14px;
        }

        .transaction-time {
          font-size: 12px;
          color: #6b7280;
        }

        .transaction-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 12px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }

        .detail-label {
          color: #6b7280;
          font-weight: 500;
        }

        .detail-value {
          color: #374151;
          font-weight: 600;
        }

        .transaction-status {
          display: flex;
          justify-content: flex-end;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-collected {
          background: #dbeafe;
          color: #1e40af;
        }

        .status-processed {
          background: #dcfce7;
          color: #166534;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 40px;
          color: #6b7280;
          text-align: center;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .transactions-container {
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

export default CollectorDashboard;