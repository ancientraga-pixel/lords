const axios = require('axios');

class SMSService {
  constructor() {
    // Using Twilio's free trial (requires signup but has free credits)
    this.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    this.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    
    // Alternative: Using SMS Gateway API (free tier available)
    this.smsGatewayApiKey = process.env.SMS_GATEWAY_API_KEY;
    this.smsGatewayUrl = 'https://www.fast2sms.com/dev/bulkV2';
  }

  async sendSMS(phoneNumber, message) {
    try {
      // Try Twilio first (free trial)
      if (this.twilioAccountSid && this.twilioAuthToken) {
        return await this.sendViaTwilio(phoneNumber, message);
      }
      
      // Fallback to Fast2SMS (free tier)
      if (this.smsGatewayApiKey) {
        return await this.sendViaFast2SMS(phoneNumber, message);
      }
      
      // Final fallback to mock SMS
      return this.mockSMS(phoneNumber, message);
    } catch (error) {
      console.error('SMS sending error:', error);
      return this.mockSMS(phoneNumber, message);
    }
  }

  async sendViaTwilio(phoneNumber, message) {
    const client = require('twilio')(this.twilioAccountSid, this.twilioAuthToken);
    
    const result = await client.messages.create({
      body: message,
      from: this.twilioPhoneNumber,
      to: phoneNumber
    });

    return {
      success: true,
      messageId: result.sid,
      provider: 'twilio'
    };
  }

  async sendViaFast2SMS(phoneNumber, message) {
    const response = await axios.post(this.smsGatewayUrl, {
      authorization: this.smsGatewayApiKey,
      sender_id: 'HERBIO',
      message: message,
      language: 'english',
      route: 'q',
      numbers: phoneNumber.replace('+', '')
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.return) {
      return {
        success: true,
        messageId: response.data.request_id,
        provider: 'fast2sms'
      };
    } else {
      throw new Error('Fast2SMS failed');
    }
  }

  mockSMS(phoneNumber, message) {
    console.log(`📱 Mock SMS to ${phoneNumber}: ${message}`);
    return {
      success: true,
      messageId: `mock_${Date.now()}`,
      provider: 'mock'
    };
  }

  // Parse SMS commands from farmers
  parseSMSCommand(message) {
    // Enhanced format: "COL ASH 25kg" or "COL ASHWAGANDHA 25kg"
    const parts = message.trim().toUpperCase().split(/\s+/);
    
    if (parts.length >= 3 && parts[0] === 'COL') {
      const speciesMap = {
        'ASH': 'Ashwagandha',
        'TUR': 'Turmeric', 
        'NEE': 'Neem',
        'TUL': 'Tulsi',
        'BRA': 'Brahmi',
        'GIL': 'Giloy',
        'AML': 'Amla',
        'ARJ': 'Arjuna'
      };
      
      let species = parts[1];
      if (speciesMap[species]) {
        species = speciesMap[species];
      }
      
      // Extract weight (remove 'kg' suffix)
      const weightStr = parts[2].replace(/[^\d.]/g, '');
      const weight = parseFloat(weightStr);
      
      if (weight && weight > 0) {
        return {
          command: 'COLLECTION',
          species: species,
          weight: weight,
          valid: true
        };
      }
    }
    
    return { 
      valid: false, 
      error: 'Invalid SMS format. Use: COL [SPECIES] [WEIGHT]kg (e.g., COL ASH 25kg)' 
    };
  }

  // Enhanced parsing for different SMS formats
  parseAdvancedSMSCommand(message) {
    // Format: "COL ASH 25kg LAT:26.9124 LNG:75.7873" (with coordinates)
    const parts = message.trim().toUpperCase().split(/\s+/);
    
    if (parts.length >= 3 && parts[0] === 'COL') {
      const speciesMap = {
        'ASH': 'Ashwagandha',
        'TUR': 'Turmeric', 
        'NEE': 'Neem',
        'TUL': 'Tulsi',
        'BRA': 'Brahmi',
        'GIL': 'Giloy',
        'AML': 'Amla',
        'ARJ': 'Arjuna'
      };
      
      let species = parts[1];
      if (speciesMap[species]) {
        species = speciesMap[species];
      }
      
      const weightStr = parts[2].replace(/[^\d.]/g, '');
      const weight = parseFloat(weightStr);
      
      // Look for coordinates
      let latitude = null;
      let longitude = null;
      
      for (let i = 3; i < parts.length; i++) {
        if (parts[i].startsWith('LAT:')) {
          latitude = parseFloat(parts[i].replace('LAT:', ''));
        }
        if (parts[i].startsWith('LNG:')) {
          longitude = parseFloat(parts[i].replace('LNG:', ''));
        }
      }
      
      return {
        command: 'COLLECTION',
        species: species,
        weight: weight,
        latitude: latitude,
        longitude: longitude,
        valid: true
      };
    }
    
    return { 
      valid: false, 
      error: 'Invalid SMS format. Use: COL [SPECIES] [WEIGHT]kg [LAT:xx.xxxx] [LNG:xx.xxxx]' 
    };
  }

  // Send QR code via SMS (as text description)
  async sendQRNotification(phoneNumber, qrData, step) {
    const message = `HERBIONYX: ${step} completed. QR ID: ${qrData.id}. Scan at next step. Track: herbionyx.com/track/${qrData.id}`;
    return this.sendSMS(phoneNumber, message);
  }
}

module.exports = new SMSService();