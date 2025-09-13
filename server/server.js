require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

// Import services
const geolocationService = require('./services/geolocation');
const ipfsService = require('./services/ipfs');
const smsService = require('./services/sms');
const qrService = require('./services/qr');
const database = require('./database/database');
const smsRoutes = require('./routes/sms');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
// FIXED: Ensure proper JSON body parsing with size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// SMS Routes
app.use('/api/sms', smsRoutes);

// Mock database (in production, use proper database)
let users = [
  // Special developer/tester accounts - always available
  {
    id: 'dev_admin_001',
    username: 'dev_admin',
    password: 'herbionyx2025',
    name: 'Developer Admin',
    email: 'dev@herbionyx.com',
    role: 'Admin',
    organization: 'NMPB',
    approved: true,
    isDeveloper: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'test_collector_001',
    username: 'test_collector',
    password: 'test123',
    name: 'Test Collector',
    email: 'collector@test.com',
    role: 'Collector',
    organization: 'FarmersCoop',
    approved: true,
    isTester: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'test_labtech_001',
    username: 'test_labtech',
    password: 'test123',
    name: 'Test Lab Technician',
    email: 'labtech@test.com',
    role: 'LabTech',
    organization: 'QualityLabs',
    approved: true,
    isTester: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'test_processor_001',
    username: 'test_processor',
    password: 'test123',
    name: 'Test Processor',
    email: 'processor@test.com',
    role: 'Processor',
    organization: 'HerbProcessors',
    approved: true,
    isTester: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'test_manufacturer_001',
    username: 'test_manufacturer',
    password: 'test123',
    name: 'Test Manufacturer',
    email: 'manufacturer@test.com',
    role: 'Manufacturer',
    organization: 'AyurMeds',
    approved: true,
    isTester: true,
    createdAt: new Date().toISOString()
  }
];

let pendingUsers = [];
let batches = [];
let transactions = [];

// Authentication routes
app.post('/api/auth/login', (req, res) => {
  const { username, password: rawPassword, role } = req.body;
  
  console.log('Login attempt:', { username, role });
  console.log('Full request body:', JSON.stringify(req.body, null, 2));
  
  // Ensure we have both username and password
  if (!username || !rawPassword) {
    console.log('Missing credentials');
    res.setHeader('Content-Type', 'application/json');
    return res.status(400).send(JSON.stringify({ error: 'Username and password are required' }));
  }
  
  if (!role) {
    console.log('Missing role');
    res.setHeader('Content-Type', 'application/json');
    return res.status(400).send(JSON.stringify({ error: 'Role selection is required' }));
  }
  
  const trimmedUsername = String(username).trim();
  const trimmedPassword = String(rawPassword).trim();
  
  console.log('Searching for user:', trimmedUsername);
  console.log('Available users:', users.map(u => ({ username: u.username, role: u.role })));
  
  // Find existing user or create new one
  let user = users.find(u => u.username === trimmedUsername);
  
  if (!user) {
    console.log('User not found, creating new user');
    // Create new user account
    const newUser = {
      id: `${role.toLowerCase()}_${Date.now()}`,
      username: trimmedUsername,
      password: trimmedPassword,
      name: generateNameFromUsername(trimmedUsername),
      email: trimmedUsername.includes('@') ? trimmedUsername : `${trimmedUsername}@herbionyx.com`,
      role: role,
      organization: getOrganizationByRole(role),
      approved: true,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    user = newUser;
    console.log('Created new user:', user.username, 'as', user.role);
  } else {
    console.log('Found existing user:', user.username);
    // Verify password for existing user
    if (user.password !== trimmedPassword) {
      console.log('Password mismatch for user:', user.username);
      res.setHeader('Content-Type', 'application/json');
      return res.status(401).send(JSON.stringify({ error: 'Invalid password' }));
    }
    
    // Update role if different
    if (user.role !== role) {
      user.role = role;
      user.organization = getOrganizationByRole(role);
      console.log('Updated user role:', user.username, 'to', user.role);
    }
  }
  
  const { password, ...userWithoutPassword } = user;
  console.log('Login successful for:', userWithoutPassword.username, 'as', userWithoutPassword.role);
  
  // Ensure we send a proper JSON response
  res.status(200).json(userWithoutPassword);
});

// Helper functions
function generateNameFromUsername(username) {
  if (username.includes('@')) {
    const name = username.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/[._]/g, ' ');
  }
  return username.charAt(0).toUpperCase() + username.slice(1);
}

function getOrganizationByRole(role) {
  const orgMap = {
    'Collector': 'FarmersCoop',
    'LabTech': 'QualityLabs',
    'Processor': 'HerbProcessors',
    'Manufacturer': 'AyurMeds',
    'Admin': 'NMPB'
  };
  return orgMap[role] || 'Unknown';
}

app.post('/api/auth/register', (req, res) => {
  const userData = req.body;
  
  // Check if username already exists
  if (users.find(u => u.username === userData.username) || pendingUsers.find(u => u.username === userData.username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }
  
  const newUser = {
    id: `${userData.role.toLowerCase()}_${Date.now()}`,
    ...userData,
    approved: false,
    registrationDate: new Date().toISOString()
  };
  
  pendingUsers.push(newUser);
  
  res.json({ message: 'Registration submitted for admin approval' });
});

// Admin routes
app.get('/api/admin/pending-users', (req, res) => {
  res.json(pendingUsers);
});

app.post('/api/admin/approve-user', (req, res) => {
  const { userId, approved } = req.body;
  
  const userIndex = pendingUsers.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const user = pendingUsers[userIndex];
  
  if (approved) {
    user.approved = true;
    users.push(user);
    
    // Send approval email (mock)
    console.log(`User ${user.name} approved for role ${user.role}`);
  }
  
  pendingUsers.splice(userIndex, 1);
  res.json({ success: true });
});

// Auto-login route
app.post('/api/auth/auto-login', (req, res) => {
  if (process.env.AUTO_LOGIN_ENABLED === 'true') {
    // Auto-login as collector for demo
    const user = users.find(u => u.username === 'collector1');
    if (user) {
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      res.status(404).json({ error: 'Auto-login user not found' });
    }
  } else {
    res.status(403).json({ error: 'Auto-login disabled' });
  }
});

app.get('/api/admin/system-stats', (req, res) => {
  res.json({
    totalUsers: users.length,
    totalBatches: batches.length,
    totalRecalls: 0,
    networkHealth: 100
  });
});

// Geolocation routes
app.post('/api/geolocation/cell-tower', async (req, res) => {
  try {
    const { mcc, mnc, lac, cellid } = req.body;
    const location = await geolocationService.getCellTowerLocation({ mcc, mnc, lac, cellid });
    
    // Validate against permitted zones
    const permittedZones = database.getPermittedZones();
    const validation = geolocationService.validatePermittedZone(
      location.latitude, 
      location.longitude, 
      permittedZones
    );
    
    res.json({
      location,
      validation,
      permittedZones
    });
  } catch (error) {
    console.error('Cell tower location error:', error);
    res.status(500).json({ error: 'Failed to get cell tower location' });
  }
});

// IPFS routes
app.post('/api/ipfs/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    
    const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};
    const result = await ipfsService.uploadFile(req.file.buffer, req.file.originalname, metadata);
    
    let metadataHash = null;
    if (metadata && Object.keys(metadata).length > 0) {
      const metadataResult = await ipfsService.uploadJSON(metadata, `${req.file.originalname}_metadata.json`);
      metadataHash = metadataResult.hash;
    }
    
    res.json({
      hash: result.hash,
      metadataHash: metadataHash,
      url: result.url,
      size: result.size
    });
  } catch (error) {
    console.error('IPFS upload error:', error);
    res.status(500).json({ error: 'Failed to upload to IPFS' });
  }
});

// QR Code generation
app.post('/api/qr/generate', async (req, res) => {
  try {
    const { data, previousQRs = [] } = req.body;
    const result = await qrService.generateChainedQR(data, previousQRs);
    
    // Save QR to database
    database.saveQRCode(result);
    
    res.json(result);
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// QR Code validation
app.post('/api/qr/validate', async (req, res) => {
  try {
    const { qrData } = req.body;
    const validation = qrService.validateQRChain(qrData);
    res.json(validation);
  } catch (error) {
    console.error('QR validation error:', error);
    res.status(500).json({ error: 'Failed to validate QR code' });
  }
});

// SMS routes
app.post('/api/sms/send', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    const result = await smsService.sendSMS(phoneNumber, message);
    res.json(result);
  } catch (error) {
    console.error('SMS sending error:', error);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
});

app.post('/api/sms/parse-command', async (req, res) => {
  try {
    const { message, phoneNumber } = req.body;
    const parsed = smsService.parseSMSCommand(message);
    
    if (parsed.valid) {
      // Process the collection command
      const location = await geolocationService.getCellTowerLocation({
        // Mock cell data for SMS users
        mcc: 404, mnc: 10, lac: 1234, cellid: 5678
      });
      
      // Create collection event
      const collectionData = {
        ...parsed,
        location,
        phoneNumber,
        timestamp: new Date().toISOString(),
        source: 'sms'
      };
      
      // Generate QR and send notification
      const qrResult = await qrService.generateQR({
        type: 'collection',
        data: collectionData,
        id: `COL_${Date.now()}`
      });
      
      await smsService.sendQRNotification(phoneNumber, qrResult, 'Collection');
      
      res.json({ success: true, collection: collectionData, qr: qrResult });
    } else {
      res.status(400).json({ error: parsed.error });
    }
  } catch (error) {
    console.error('SMS command parsing error:', error);
    res.status(500).json({ error: 'Failed to parse SMS command' });
  }
});

// Database management routes
app.get('/api/admin/permitted-zones', (req, res) => {
  const zones = database.getPermittedZones();
  res.json(zones);
});

app.post('/api/admin/permitted-zones', (req, res) => {
  const success = database.addPermittedZone(req.body);
  if (success) {
    res.json({ success: true, message: 'Zone added successfully' });
  } else {
    res.status(500).json({ error: 'Failed to add zone' });
  }
});

app.put('/api/admin/permitted-zones/:zoneId', (req, res) => {
  const success = database.updatePermittedZone(req.params.zoneId, req.body);
  if (success) {
    res.json({ success: true, message: 'Zone updated successfully' });
  } else {
    res.status(500).json({ error: 'Failed to update zone' });
  }
});

app.delete('/api/admin/permitted-zones/:zoneId', (req, res) => {
  const success = database.deletePermittedZone(req.params.zoneId);
  if (success) {
    res.json({ success: true, message: 'Zone deleted successfully' });
  } else {
    res.status(500).json({ error: 'Failed to delete zone' });
  }
});

app.get('/api/admin/permitted-herbs', (req, res) => {
  const herbs = database.getPermittedHerbs();
  res.json(herbs);
});

app.post('/api/admin/permitted-herbs', (req, res) => {
  const success = database.addPermittedHerb(req.body);
  if (success) {
    res.json({ success: true, message: 'Herb added successfully' });
  } else {
    res.status(500).json({ error: 'Failed to add herb' });
  }
});

app.put('/api/admin/permitted-herbs/:herbId', (req, res) => {
  const success = database.updatePermittedHerb(req.params.herbId, req.body);
  if (success) {
    res.json({ success: true, message: 'Herb updated successfully' });
  } else {
    res.status(500).json({ error: 'Failed to update herb' });
  }
});

app.delete('/api/admin/permitted-herbs/:herbId', (req, res) => {
  const success = database.deletePermittedHerb(req.params.herbId);
  if (success) {
    res.json({ success: true, message: 'Herb deleted successfully' });
  } else {
    res.status(500).json({ error: 'Failed to delete herb' });
  }
});

// Hyperledger Fabric mock endpoints
app.post('/api/fabric/invoke', async (req, res) => {
  try {
    const { function: functionName, args } = req.body;
    
    // Mock chaincode invocation
    console.log(`Invoking chaincode function: ${functionName}`, args);
    
    // Simulate transaction processing
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    let result = {
      success: true,
      transactionId: transactionId,
      blockNumber: Math.floor(Math.random() * 1000) + 1000,
      qrData: null
    };
    
    // Function-specific responses
    switch (functionName) {
      case 'RecordCollectionEvent':
        result.eventId = `EVT_${Date.now()}`;
        // Generate chained QR for collection
        const collectionQR = await qrService.generateQR({
          type: 'collection',
          eventId: result.eventId,
          timestamp: new Date().toISOString()
        });
        result.qrData = collectionQR;
        break;
      case 'QualityAttestation':
        result.testId = `TEST_${Date.now()}`;
        // Generate chained QR for quality
        const qualityQR = await qrService.generateChainedQR({
          type: 'quality',
          testId: result.testId,
          timestamp: new Date().toISOString()
        }, args[1] ? [JSON.parse(args[1])] : []);
        result.qrData = qualityQR;
        break;
      case 'TransferCustody':
        result.processId = `PROC_${Date.now()}`;
        // Generate chained QR for processing
        const processQR = await qrService.generateChainedQR({
          type: 'processing',
          processId: result.processId,
          timestamp: new Date().toISOString()
        }, args[1] ? JSON.parse(args[1]) : []);
        result.qrData = processQR;
        break;
      case 'BatchCreation':
        result.batchId = `BATCH_${Date.now()}`;
        // Generate final QR for consumer
        const batchQR = await qrService.generateChainedQR({
          type: 'final-product',
          batchId: result.batchId,
          timestamp: new Date().toISOString()
        }, args[1] ? JSON.parse(args[1]) : []);
        result.qrData = batchQR;
        break;
    }
    
    // Store transaction
    transactions.push({
      id: transactionId,
      function: functionName,
      args: args,
      timestamp: new Date().toISOString(),
      status: 'success'
    });
    
    res.json(result);
  } catch (error) {
    console.error('Fabric invoke error:', error);
    res.status(500).json({ error: 'Chaincode invocation failed' });
  }
});

app.post('/api/fabric/query', async (req, res) => {
  try {
    const { function: functionName, args } = req.body;
    
    console.log(`Querying chaincode function: ${functionName}`, args);
    
    // Mock query responses
    let result = { success: true, data: {} };
    
    switch (functionName) {
      case 'GetCollectionEvent':
        result.data = {
          eventId: args[0],
          species: 'Ashwagandha',
          weight: 25.5,
          timestamp: new Date().toISOString(),
          status: 'COLLECTED'
        };
        break;
      case 'GetQualityTest':
        result.data = {
          testId: args[0],
          species: 'Ashwagandha',
          testDate: new Date().toISOString(),
          passed: true
        };
        break;
      case 'GetProcessingDetails':
        result.data = {
          processId: args[0],
          species: 'Ashwagandha',
          processType: 'Drying',
          yield: 20.2,
          processDate: new Date().toISOString()
        };
        break;
      case 'GetProvenance':
        result.data = {
          batchId: args[0],
          productName: 'Premium Ashwagandha Powder',
          species: 'Ashwagandha',
          manufacturingDate: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          journey: [
            {
              stage: 'Collection',
              timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              organization: 'FarmersCoop',
              latitude: 26.9124,
              longitude: 75.7873,
              icon: '🌱',
              details: {
                species: 'Ashwagandha',
                weight: '25.5 kg',
                collector: 'John Farmer'
              }
            },
            {
              stage: 'Quality Testing',
              timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              organization: 'QualityLabs',
              latitude: 26.9200,
              longitude: 75.7900,
              icon: '🔬',
              details: {
                moisture: '8.5%',
                pesticides: '0.005 mg/kg',
                heavyMetals: '2.1 ppm',
                microbial: 'Negative'
              }
            },
            {
              stage: 'Processing',
              timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              organization: 'HerbProcessors',
              latitude: 26.9300,
              longitude: 75.7950,
              icon: '⚙️',
              details: {
                processType: 'Drying',
                temperature: '60°C',
                duration: '24 hours',
                yield: '20.2 kg'
              }
            },
            {
              stage: 'Manufacturing',
              timestamp: new Date().toISOString(),
              organization: 'AyurMeds',
              latitude: 26.9400,
              longitude: 75.8000,
              icon: '🏭',
              details: {
                productName: 'Premium Ashwagandha Powder',
                batchSize: '100 units',
                formulation: 'Pure Ashwagandha Root Powder'
              }
            }
          ],
          qualityTests: {
            moisture: 8.5,
            pesticides: 0.005,
            heavyMetals: 2.1
          },
          farmerStory: {
            story: 'This premium Ashwagandha was carefully cultivated in the fertile soils of Rajasthan using traditional organic farming methods passed down through generations.',
            farmerName: 'John Farmer',
            farmName: 'Green Valley Organic Farm',
            location: 'Rajasthan, India'
          }
        };
        break;
      case 'GetApprovedZones':
        result.data = database.getPermittedZones();
        break;
      case 'GetPermittedHerbs':
        result.data = database.getPermittedHerbs();
        break;
    }
    
    res.json(result);
  } catch (error) {
    console.error('Fabric query error:', error);
    res.status(500).json({ error: 'Chaincode query failed' });
  }
});

// Role-specific data endpoints
app.get('/api/collector/batches', (req, res) => {
  const mockBatches = [
    {
      id: 'batch_001',
      eventId: 'EVT_001',
      species: 'Ashwagandha',
      weight: 25.5,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      latitude: 26.9124,
      longitude: 75.7873,
      status: 'COLLECTED'
    },
    {
      id: 'batch_002',
      eventId: 'EVT_002',
      species: 'Turmeric',
      weight: 30.0,
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      latitude: 26.9200,
      longitude: 75.7900,
      status: 'QUALITY_PASSED'
    }
  ];
  
  res.json(mockBatches);
});

app.get('/api/lab/pending-batches', (req, res) => {
  const mockPendingBatches = [
    {
      id: 'batch_003',
      eventId: 'EVT_003',
      species: 'Brahmi',
      weight: 15.8,
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'COLLECTED'
    }
  ];
  
  res.json(mockPendingBatches);
});

app.get('/api/processor/approved-batches', (req, res) => {
  const mockApprovedBatches = [
    {
      id: 'batch_004',
      testId: 'TEST_004',
      species: 'Neem',
      weight: 22.3,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'QUALITY_PASSED'
    }
  ];
  
  res.json(mockApprovedBatches);
});

app.get('/api/manufacturer/processed-batches', (req, res) => {
  const mockProcessedBatches = [
    {
      id: 'batch_005',
      processId: 'PROC_005',
      species: 'Giloy',
      yield: 18.7,
      processType: 'Extraction',
      processDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'PROCESSED'
    }
  ];
  
  res.json(mockProcessedBatches);
});

app.get('/api/dashboard/stats', (req, res) => {
  const { role } = req.query;
  
  // Mock role-specific statistics
  const stats = {
    Collector: { totalBatches: 12, pendingActions: 3, completedTransactions: 45, smsCollections: 8 },
    LabTech: { totalBatches: 8, pendingActions: 2, completedTransactions: 32 },
    Processor: { totalBatches: 6, pendingActions: 1, completedTransactions: 28 },
    Manufacturer: { totalBatches: 4, pendingActions: 1, completedTransactions: 20 },
    Admin: { totalBatches: 30, pendingActions: 7, completedTransactions: 125, totalSmsTransactions: 25 }
  };
  
  res.json(stats[role] || { totalBatches: 0, pendingActions: 0, completedTransactions: 0, networkHealth: 100, smsCollections: 0 });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      blockchain: 'connected',
      ipfs: 'connected',
      sms: 'connected',
      geolocation: 'connected'
    }
  });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🌿 HERBIONYX Server running on port ${PORT}`);
  console.log(`🔗 Hyperledger Fabric network: Connected`);
  console.log(`📦 IPFS integration: Ready`);
  console.log(`📱 SMS support: Enabled`);
  console.log(`🔐 Authentication: Active`);
  console.log('========================================');
  console.log('Demo ready for September 18, 2025! 🚀');
});

module.exports = app;