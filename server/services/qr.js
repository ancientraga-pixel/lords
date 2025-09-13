const QRCode = require('qrcode');

class QRService {
  constructor() {
    // Using QRCode library (completely free, no API needed)
    this.defaultOptions = {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    };
  }

  async generateQR(data, options = {}) {
    try {
      const qrData = typeof data === 'object' ? JSON.stringify(data) : data;
      const qrOptions = { ...this.defaultOptions, ...options };
      
      // Generate QR code as data URL
      const qrCodeDataURL = await QRCode.toDataURL(qrData, qrOptions);
      
      return {
        qrCodeUrl: qrCodeDataURL,
        data: qrData,
        format: 'png',
        size: options.width || 256,
        id: this.generateQRId()
      };
    } catch (error) {
      console.error('QR generation error:', error);
      throw error;
    }
  }

  // Generate QR with previous step data included
  async generateChainedQR(currentData, previousQRs = []) {
    const chainedData = {
      current: currentData,
      chain: previousQRs,
      timestamp: new Date().toISOString(),
      network: 'HERBIONYX',
      id: this.generateQRId()
    };

    return this.generateQR(chainedData);
  }

  // Generate SVG QR code (smaller file size)
  async generateQRSVG(data, options = {}) {
    try {
      const qrData = typeof data === 'object' ? JSON.stringify(data) : data;
      const svgString = await QRCode.toString(qrData, { 
        type: 'svg',
        ...options 
      });
      
      return {
        qrCodeSVG: svgString,
        data: qrData,
        format: 'svg',
        id: this.generateQRId()
      };
    } catch (error) {
      console.error('QR SVG generation error:', error);
      throw error;
    }
  }

  // Generate QR code to file (for server-side storage)
  async generateQRToFile(data, filePath, options = {}) {
    try {
      const qrData = typeof data === 'object' ? JSON.stringify(data) : data;
      await QRCode.toFile(filePath, qrData, { ...this.defaultOptions, ...options });
      
      return {
        filePath: filePath,
        data: qrData,
        id: this.generateQRId()
      };
    } catch (error) {
      console.error('QR file generation error:', error);
      throw error;
    }
  }

  // Validate QR chain integrity
  validateQRChain(qrData) {
    try {
      const data = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
      
      if (!data.current || !data.chain) {
        return { valid: false, error: 'Invalid QR structure' };
      }

      // Validate chain sequence
      const expectedSteps = ['collection', 'quality', 'processing', 'manufacturing'];
      const currentStepIndex = expectedSteps.indexOf(data.current.type);
      
      if (currentStepIndex === -1) {
        return { valid: false, error: 'Invalid step type' };
      }

      if (data.chain.length !== currentStepIndex) {
        return { valid: false, error: 'Broken chain sequence' };
      }

      return { valid: true, data: data };
    } catch (error) {
      return { valid: false, error: 'QR parsing failed' };
    }
  }

  generateQRId() {
    return 'QR_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

module.exports = new QRService();