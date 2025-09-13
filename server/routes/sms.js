const express = require('express');
const router = express.Router();
const smsService = require('../services/sms');
const geolocationService = require('../services/geolocation');
const qrService = require('../services/qr');

// Store SMS transactions in memory (in production, use database)
let smsTransactions = [];

// SMS webhook endpoint (for receiving SMS from providers like Twilio)
router.post('/webhook', async (req, res) => {
  try {
    const { From: phoneNumber, Body: message } = req.body;
    
    console.log(`Received SMS from ${phoneNumber}: ${message}`);
    
    // Parse SMS command
    const parsed = smsService.parseSMSCommand(message);
    
    if (parsed.valid) {
      // Get location from cell tower data (mock for demo)
      const location = await geolocationService.getCellTowerLocation({
        mcc: 404, // India
        mnc: 10,  // Mock network
        lac: Math.floor(Math.random() * 10000),
        cellid: Math.floor(Math.random() * 100000)
      });
      
      // Create collection event data
      const collectionData = {
        species: parsed.species,
        weight: parsed.weight,
        latitude: location.latitude,
        longitude: location.longitude,
        phoneNumber: phoneNumber,
        timestamp: new Date().toISOString(),
        source: 'sms',
        rawMessage: message
      };
      
      // Generate QR code for the collection
      const qrResult = await qrService.generateQR({
        type: 'collection',
        eventId: `SMS_${Date.now()}`,
        data: collectionData,
        timestamp: new Date().toISOString()
      });
      
      // Store SMS transaction
      const smsTransaction = {
        id: `SMS_${Date.now()}`,
        phoneNumber: phoneNumber,
        message: message,
        parsed: parsed,
        location: location,
        collectionData: collectionData,
        qrCode: qrResult,
        timestamp: new Date().toISOString(),
        status: 'processed'
      };
      
      smsTransactions.push(smsTransaction);
      
      // Send confirmation SMS back to farmer
      const confirmationMessage = `HERBIONYX: Collection recorded! Species: ${parsed.species}, Weight: ${parsed.weight}kg. QR ID: ${qrResult.id}. Thank you!`;
      await smsService.sendSMS(phoneNumber, confirmationMessage);
      
      // Simulate blockchain transaction (in production, would call actual chaincode)
      console.log('SMS Collection recorded on blockchain:', collectionData);
      
      res.json({ success: true, transaction: smsTransaction });
    } else {
      // Send error message back to farmer
      const errorMessage = `HERBIONYX: Invalid format. Please send: COL [SPECIES] [WEIGHT]kg. Example: COL ASH 25kg`;
      await smsService.sendSMS(phoneNumber, errorMessage);
      
      res.status(400).json({ error: parsed.error });
    }
  } catch (error) {
    console.error('SMS webhook error:', error);
    res.status(500).json({ error: 'Failed to process SMS' });
  }
});

// Get SMS transactions for dashboard
router.get('/transactions', (req, res) => {
  // Return recent SMS transactions
  const recentTransactions = smsTransactions
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 20)
    .map(tx => ({
      id: tx.id,
      phoneNumber: tx.phoneNumber,
      species: tx.parsed.species,
      weight: tx.parsed.weight,
      latitude: tx.location.latitude,
      longitude: tx.location.longitude,
      timestamp: tx.timestamp,
      status: tx.status,
      source: 'sms'
    }));
  
  res.json(recentTransactions);
});

// Send SMS manually (for testing)
router.post('/send', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    const result = await smsService.sendSMS(phoneNumber, message);
    res.json(result);
  } catch (error) {
    console.error('SMS sending error:', error);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
});

// Test SMS parsing
router.post('/parse', (req, res) => {
  try {
    const { message } = req.body;
    const parsed = smsService.parseSMSCommand(message);
    res.json(parsed);
  } catch (error) {
    console.error('SMS parsing error:', error);
    res.status(500).json({ error: 'Failed to parse SMS' });
  }
});

// Simulate SMS collection (for demo purposes)
router.post('/simulate', async (req, res) => {
  try {
    const { phoneNumber, species, weight } = req.body;
    
    // Create mock SMS message
    const message = `COL ${species.substring(0, 3).toUpperCase()} ${weight}kg`;
    
    // Process as if received via SMS
    const parsed = smsService.parseSMSCommand(message);
    
    if (parsed.valid) {
      const location = await geolocationService.getCellTowerLocation({
        mcc: 404,
        mnc: 10,
        lac: Math.floor(Math.random() * 10000),
        cellid: Math.floor(Math.random() * 100000)
      });
      
      const collectionData = {
        species: species,
        weight: parseFloat(weight),
        latitude: location.latitude,
        longitude: location.longitude,
        phoneNumber: phoneNumber,
        timestamp: new Date().toISOString(),
        source: 'sms_simulation',
        rawMessage: message
      };
      
      const qrResult = await qrService.generateQR({
        type: 'collection',
        eventId: `SIM_${Date.now()}`,
        data: collectionData,
        timestamp: new Date().toISOString()
      });
      
      const smsTransaction = {
        id: `SIM_${Date.now()}`,
        phoneNumber: phoneNumber,
        message: message,
        parsed: { species, weight: parseFloat(weight), valid: true },
        location: location,
        collectionData: collectionData,
        qrCode: qrResult,
        timestamp: new Date().toISOString(),
        status: 'processed'
      };
      
      smsTransactions.push(smsTransaction);
      
      res.json({ success: true, transaction: smsTransaction });
    } else {
      res.status(400).json({ error: 'Invalid simulation data' });
    }
  } catch (error) {
    console.error('SMS simulation error:', error);
    res.status(500).json({ error: 'Failed to simulate SMS' });
  }
});

module.exports = router;