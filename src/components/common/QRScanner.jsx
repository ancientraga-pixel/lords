import React, { useEffect, useRef, useState } from 'react';

function QRScanner({ onScan }) {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);

  const startScanning = () => {
    // Mock scanner for demo
    setIsScanning(true);
    
    // Simulate scan after 2 seconds
    setTimeout(() => {
      const mockQRData = JSON.stringify({
        type: 'collection',
        eventId: 'EVT_' + Date.now(),
        timestamp: new Date().toISOString()
      });
      onScan(mockQRData);
      setIsScanning(false);
    }, 2000);
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);

        // Here you would integrate with a QR code reading library
        // For demo purposes, we'll simulate a scan
        const mockQRData = prompt('Enter QR data (for demo):');
        if (mockQRData) {
          onScan(mockQRData);
        }
      };
      image.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="qr-scanner">
      <div className="scanner-controls">
        {!isScanning ? (
          <button onClick={startScanning} className="button">
            Start Camera Scan
          </button>
        ) : (
          <button onClick={stopScanning} className="button danger">
            Stop Scanning
          </button>
        )}
        
        <div className="file-upload-section">
          <label htmlFor="qr-file-upload" className="button secondary">
            Upload QR Image
          </label>
          <input
            id="qr-file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      <div id="qr-reader" ref={scannerRef} className="qr-reader"></div>

      {!isScanning && (
        <div className="scanner-placeholder">
          <div className="placeholder-icon">📷</div>
          <p>Click "Start Camera Scan" or upload QR image</p>
        </div>
      )}

      <style jsx>{`
        .qr-scanner {
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
        }

        .scanner-controls {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }

        .file-upload-section {
          text-align: center;
        }

        .qr-reader {
          width: 100%;
          border-radius: 12px;
          overflow: hidden;
          background: rgba(248, 249, 250, 0.8);
          min-height: 250px;
        }

        .scanner-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 250px;
          color: #6c757d;
          text-align: center;
          background: rgba(248, 249, 250, 0.8);
          border-radius: 12px;
          border: 2px dashed #ced4da;
        }

        .placeholder-icon {
          font-size: 48px;
          margin-bottom: 15px;
          opacity: 0.6;
        }

        @media (max-width: 768px) {
          .scanner-controls {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

export default QRScanner;