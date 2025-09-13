import React, { useEffect, useRef } from 'react';

function QRGenerator({ data, size = 256 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (data && canvasRef.current) {
      // Mock QR code generation for demo
      const ctx = canvasRef.current.getContext('2d');
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('QR CODE', size/2, size/2);
    }
  }, [data, size]);

  const downloadQR = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `qr-code-${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  const printQR = () => {
    if (canvasRef.current) {
      const printWindow = window.open('', '_blank');
      const img = canvasRef.current.toDataURL();
      printWindow.document.write(`
        <html>
          <head><title>QR Code</title></head>
          <body style="text-align: center; padding: 20px;">
            <h2>HERBIONYX Traceability QR Code</h2>
            <img src="${img}" style="max-width: 100%;" />
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!data) {
    return (
      <div className="qr-placeholder">
        <div className="qr-icon">📱</div>
        <p>QR code will be generated here</p>
      </div>
    );
  }

  return (
    <div className="qr-generator">
      <div className="qr-display">
        <canvas ref={canvasRef} className="qr-canvas" />
      </div>
      
      <div className="qr-actions">
        <button onClick={downloadQR} className="button secondary">
          Download QR
        </button>
        <button onClick={printQR} className="button secondary">
          Print QR
        </button>
      </div>

      <div className="qr-info">
        <small>Scan this QR code to verify traceability</small>
      </div>

      <style jsx>{`
        .qr-generator {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          padding: 20px;
          background: rgba(248, 249, 250, 0.8);
          border-radius: 12px;
          border: 2px solid #e9ecef;
        }

        .qr-display {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .qr-canvas {
          display: block;
        }

        .qr-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          color: #6c757d;
          text-align: center;
        }

        .qr-icon {
          font-size: 48px;
          margin-bottom: 10px;
          opacity: 0.6;
        }

        .qr-actions {
          display: flex;
          gap: 10px;
        }

        .qr-info {
          text-align: center;
          color: #6c757d;
        }

        @media (max-width: 768px) {
          .qr-actions {
            flex-direction: column;
            width: 100%;
          }
          
          .qr-actions .button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default QRGenerator;