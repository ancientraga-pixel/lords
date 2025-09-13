# HERBIONYX - Hyperledger Fabric Ayurvedic Herbs Traceability System

## 🌿 Complete Implementation Guide

**HERBIONYX** is a comprehensive blockchain-based traceability system for Ayurvedic herbs using Hyperledger Fabric v3.1.1, designed specifically for rural farmers, processors, manufacturers, and consumers. This system ensures transparency, authenticity, and compliance with NMPB/GACP guidelines.

---

## 📋 System Overview

### Core Architecture

- **Hyperledger Fabric Network**: Permissioned blockchain with 5 organizations
- **Smart Contracts**: Java-based chaincode with geo-fencing and quality gates
- **IPFS Integration**: Decentralized storage for images and metadata
- **Cross-Platform App**: React.js web application with mobile-responsive design
- **SMS Support**: Rural farmer integration via Nodemailer
- **QR Code System**: Complete traceability from farm to consumer
- **Role-Based Access**: Secure MSP-based authentication

### Organizations Structure

1. **FarmersCoop** (`FarmersCoopMSP`) - Collectors/Farmers
2. **LabsOrg** (`LabsOrgMSP`) - Quality Testing Labs
3. **ProcessorsOrg** (`ProcessorsOrgMSP`) - Herb Processors
4. **ManufacturersOrg** (`ManufacturersOrgMSP`) - Product Manufacturers
5. **NMPBOrg** (`NMPBOrgMSP`) - NMPB Admin/Regulatory Body

---

## 🚀 Quick Start Guide

### Prerequisites

- **Docker** 20.x+
- **Node.js** 18.x+
- **Java** 11+ (for chaincode)
- **Git**
- **8GB RAM minimum**

### Installation Steps

1. **Clone Repository**
```bash
git clone <repository-url>
cd herbionyx-traceability-system
```

2. **Install Dependencies**
```bash
npm install
```

3. **Start Hyperledger Fabric Network**
```bash
npm run start-network
# This runs: cd hyperledger && docker-compose up -d
```

4. **Install Chaincode**
```bash
npm run install-chaincode
# Deploys Java chaincode to all peers
```

5. **Start Application**
```bash
npm run dev
# React development server on http://localhost:3000
```

6. **Start Backend Server** (New Terminal)
```bash
npm run server
# Express server on http://localhost:5000
```

### Demo Access

- **URL**: http://localhost:3000
- **Demo Date**: September 18, 2025
- **Login Credentials**:
  - Collector: `collector1` / `password123`
  - Lab Tech: `labtech1` / `password123`
  - Processor: `processor1` / `password123`
  - Manufacturer: `manufacturer1` / `password123`
  - Admin: `nmpb_admin` / `admin123`

---

## 🔄 Complete Workflow

### Step 1: Collection Event (Farmers/Collectors)

**Process**: Rural farmers collect herbs and record data

**Features**:
- **GPS Validation**: Geolocation API validates collection within approved zones
- **Species Selection**: Pre-loaded list (Ashwagandha, Turmeric, Neem, etc.)
- **Weight Recording**: Digital scale integration
- **Image Upload**: Optional photos via camera/file upload
- **Metadata**: JSON metadata (farmer notes, conditions, etc.)
- **SMS Alternative**: Text-based data entry for basic phones

**Technical Implementation**:
```javascript
// Collection Form Component
const recordCollection = async (data) => {
  // Validate GPS coordinates
  const location = await getCurrentLocation();
  
  // Upload image to IPFS
  const imageHash = await uploadToIPFS(data.image);
  
  // Create metadata bundle
  const metadata = {
    collectorNotes: data.notes,
    collectionDate: new Date().toISOString(),
    gpsCoordinates: location,
    soilConditions: data.soilConditions
  };
  
  const metadataHash = await uploadToIPFS(new Blob([JSON.stringify(metadata)]));
  
  // Invoke chaincode
  await invokeChaincode('RecordCollectionEvent', {
    species: data.species,
    weight: data.weight,
    latitude: location.lat,
    longitude: location.lng,
    imageHash: imageHash,
    metadataHash: metadataHash
  });
};
```

**Output**: QR Code 1 with collection event ID and IPFS hashes

### Step 2: Quality Testing (Labs)

**Process**: Licensed labs perform quality attestation

**Features**:
- **QR Scanning**: Scan Collection QR to retrieve batch details
- **NMPB Standards**: Automated validation against quality thresholds
- **Test Parameters**:
  - Moisture Content (< 12%)
  - Pesticides Level (< 0.01 mg/kg)
  - Heavy Metals (< 10 ppm)
  - Microbial Testing (Negative)
- **Lab Reports**: PDF generation and IPFS storage
- **Pass/Fail Logic**: Automated quality gate enforcement

**Java Chaincode Logic**:
```java
@Transaction(intent = Transaction.TYPE.SUBMIT)
public QualityAttestation qualityAttestation(Context ctx, String attestationData) {
    // Verify lab technician permissions
    if (!ctx.getClientIdentity().getMSPID().equals("LabsOrgMSP")) {
        throw new ChaincodeException("Unauthorized access");
    }
    
    // Validate quality thresholds
    if (!validateQualityGates(data.testResults)) {
        throw new ChaincodeException("Batch failed quality gate validation");
    }
    
    // Generate quality attestation with IPFS hashes
    // ...
}
```

**Output**: QR Code 2 with quality test results and certification

### Step 3: Processing (Processors)

**Process**: Herb processing and custody transfer

**Features**:
- **QR Verification**: Scan Quality QR to confirm passed tests
- **Processing Types**: Drying, Grinding, Extraction, Purification
- **Parameter Logging**: Temperature, duration, yield tracking
- **Yield Calculations**: Automatic weight loss calculations
- **Processing Images**: Before/after photos
- **Custody Chain**: Immutable custody transfer records

**Output**: QR Code 3 with processing details and yield information

### Step 4: Manufacturing (Final Products)

**Process**: Final product creation and batch tokenization

**Features**:
- **QR Verification**: Scan Processing QR to confirm processed materials
- **Product Details**: Name, formulation, batch size, expiry
- **Compliance Certificates**: GMP, GACP, AYUSH approvals
- **Full Provenance**: Complete farm-to-shelf journey compilation
- **Batch Tokenization**: Unique blockchain token for each product batch

**Output**: QR Code 4 for consumer verification (printed on packaging)

### Step 5: Consumer Verification

**Process**: End consumers verify product authenticity

**Features**:
- **QR Scanning**: Mobile-friendly PWA scanner
- **Interactive Map**: Journey visualization with Leaflet.js
- **Timeline View**: Complete traceability timeline
- **Quality Metrics**: Test results and certifications
- **Farmer Stories**: IPFS-hosted farmer narratives and images
- **Authenticity Badge**: Blockchain-verified authenticity confirmation

---

## 🏗️ Technical Architecture

### Frontend Architecture (React.js)

```
src/
├── components/
│   ├── common/
│   │   ├── QRScanner.jsx          # QR code scanning
│   │   ├── QRGenerator.jsx        # QR code generation
│   │   ├── ImageUpload.jsx        # File upload component
│   │   └── GeolocationInput.jsx   # GPS location input
│   └── dashboard/
│       ├── CollectorDashboard.jsx     # Farmer interface
│       ├── LabTechDashboard.jsx       # Lab technician interface
│       ├── ProcessorDashboard.jsx     # Processor interface
│       ├── ManufacturerDashboard.jsx  # Manufacturer interface
│       └── AdminDashboard.jsx         # NMPB admin interface
├── context/
│   ├── AuthContext.jsx           # Authentication management
│   └── BlockchainContext.jsx     # Fabric integration
├── pages/
│   ├── LoginPage.jsx             # User authentication
│   ├── RegisterPage.jsx          # Self-registration
│   ├── Dashboard.jsx             # Role-based dashboard
│   ├── ConsumerPortal.jsx        # Consumer verification
│   └── AdminPanel.jsx            # Admin management
└── App.jsx                       # Main application component
```

### Backend Architecture (Express.js)

```
server/
└── server.js                    # Main server file
    ├── Authentication Routes    # Login/Register/Approval
    ├── IPFS Integration        # Image/metadata upload
    ├── QR Code Generation      # Canvas API integration
    ├── Fabric Mock APIs        # Chaincode simulation
    ├── SMS Simulation          # Nodemailer integration
    └── Health Monitoring       # System status
```

### Blockchain Architecture (Hyperledger Fabric)

```
hyperledger/
├── configtx.yaml               # Network configuration
├── docker-compose.yaml         # Container orchestration
└── organizations/              # MSP certificates
    ├── ordererOrganizations/
    └── peerOrganizations/
        ├── farmers.herbionyx.com/
        ├── labs.herbionyx.com/
        ├── processors.herbionyx.com/
        ├── manufacturers.herbionyx.com/
        └── nmpb.herbionyx.com/
```

### Smart Contract Architecture (Java)

```
chaincode/herbtraceability/
└── HerbTraceability.java       # Main chaincode contract
    ├── RecordCollectionEvent   # Farmer data collection
    ├── QualityAttestation      # Lab quality testing
    ├── TransferCustody         # Processor custody transfer
    ├── BatchCreation           # Manufacturer tokenization
    ├── ValidateGeoFence        # Zone validation
    ├── UpdateApprovedZones     # Admin zone management
    ├── InitiateRecall          # Product recall
    └── GetProvenance           # Consumer queries
```

---

## 🔐 Security Implementation

### Multi-Signature Policy (MSP)

Each organization has its own MSP with role-based access:

```yaml
Organizations:
  - &FarmersCoop
    Name: FarmersCoopMSP
    Policies:
      Readers: "OR('FarmersCoopMSP.admin', 'FarmersCoopMSP.peer', 'FarmersCoopMSP.client')"
      Writers: "OR('FarmersCoopMSP.admin', 'FarmersCoopMSP.client')"
      Admins: "OR('FarmersCoopMSP.admin')"
```

### Smart Contract Access Control

```java
// Only registered collectors can record collection events
if (!clientMSPID.equals("FarmersCoopMSP")) {
    throw new ChaincodeException("Only registered collectors can record collection events");
}

// Only lab technicians can perform quality attestation
if (!clientMSPID.equals("LabsOrgMSP")) {
    throw new ChaincodeException("Only registered lab technicians can perform quality attestation");
}
```

### Data Encryption

- **TLS**: All peer-to-peer communication encrypted
- **Private Data Collections**: Sensitive data encrypted at rest
- **Certificate Management**: Fabric CA handles all certificates

---

## 📱 Mobile Integration

### Progressive Web App (PWA)

```javascript
// Service Worker for offline functionality
const CACHE_NAME = 'herbionyx-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});
```

### SMS Integration for Rural Areas

```javascript
// SMS-based data collection
app.post('/api/sms/collect', (req, res) => {
  const { from, body } = req.body;
  
  // Parse SMS format: "COL ASH 26.2 73.3 500g"
  const [command, species, lat, lng, weight] = body.split(' ');
  
  if (command === 'COL') {
    // Process collection data
    processCollectionSMS({ species, lat, lng, weight, from });
  }
  
  res.json({ success: true });
});
```

---

## 🌍 Geofencing & Compliance

### Approved Cultivation Zones

The system pre-loads approved cultivation zones:

```java
// Mock zones for demo (production would use real NMPB zones)
ApprovedZone[] zones = {
    new ApprovedZone("Rajasthan Zone 1", 26.9124, 75.7873, 27.2124, 76.0873, 500),
    new ApprovedZone("Gujarat Zone 1", 23.0225, 72.5714, 23.3225, 72.8714, 400),
    new ApprovedZone("Maharashtra Zone 1", 19.0760, 72.8777, 19.3760, 73.1777, 600),
    // ... more zones
};
```

### Seasonal Restrictions

```java
// Validate seasonal restrictions (e.g., Ashwagandha: Oct-Mar)
private boolean validateSeasonalRestrictions(String species, String timestamp) {
    if ("Ashwagandha".equals(species)) {
        // Check if collection date falls within permitted season
        return isWithinPermittedSeason(timestamp);
    }
    return true;
}
```

### Quality Standards (NMPB/GACP)

```java
// NMPB quality thresholds
private boolean validateQualityGates(TestResults results) {
    return results.moisture < 12.0 &&         // Max 12% moisture
           results.pesticides < 0.01 &&       // Max 0.01 mg/kg pesticides
           results.heavyMetals < 10.0 &&      // Max 10 ppm heavy metals
           "Negative".equals(results.microbial); // Must be negative for microbial
}
```

---

## 📊 IPFS Integration

### Image and Metadata Storage

```javascript
// Upload image and metadata to IPFS
const uploadToIPFS = async (file, metadata) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await fetch('/api/ipfs/upload', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    return {
      hash: result.hash,
      url: `https://ipfs.io/ipfs/${result.hash}`
    };
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw error;
  }
};
```

### Metadata Structure

```json
{
  "collectorNotes": "High quality Ashwagandha roots harvested during optimal season",
  "collectionDate": "2025-09-11T02:28:00Z",
  "gpsCoordinates": {
    "lat": 26.9124,
    "lng": 75.7873,
    "accuracy": 5.2
  },
  "soilConditions": {
    "pH": 6.8,
    "moisture": "optimal",
    "organic_content": "high"
  },
  "weather": {
    "temperature": 28,
    "humidity": 65,
    "conditions": "clear"
  },
  "certification": {
    "organic": true,
    "gacp_compliant": true
  }
}
```

---

## 🔍 Consumer Verification Portal

### QR Code Scanning

```javascript
// Consumer QR scanning component
const ConsumerScanner = () => {
  const [scannedData, setScannedData] = useState(null);
  
  const handleScan = async (qrData) => {
    const data = JSON.parse(qrData);
    
    if (data.type === 'final-product') {
      // Get complete provenance from blockchain
      const provenance = await queryChaincode('GetProvenance', [data.batchId]);
      setScannedData(provenance);
    }
  };
  
  return (
    <div className="consumer-scanner">
      <QRScanner onScan={handleScan} />
      {scannedData && <ProvenanceDisplay data={scannedData} />}
    </div>
  );
};
```

### Interactive Journey Map

```javascript
// Leaflet.js integration for journey visualization
const JourneyMap = ({ journey }) => {
  const positions = journey.map(step => [step.latitude, step.longitude]);
  
  return (
    <MapContainer center={positions[0]} zoom={8}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Polyline positions={positions} color="green" weight={3} />
      {journey.map((step, index) => (
        <Marker key={index} position={[step.latitude, step.longitude]}>
          <Popup>
            <div>
              <strong>{step.stage}</strong><br />
              {step.organization}<br />
              {new Date(step.timestamp).toLocaleDateString()}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
```

---

## 👨‍💼 Administrative Features

### User Management

```javascript
// Admin user approval system
const AdminUserManagement = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  
  const approveUser = async (userId) => {
    await fetch('/api/admin/approve-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, approved: true })
    });
    
    // Trigger Fabric CA enrollment
    await enrollUser(userId);
  };
  
  return (
    <div className="user-management">
      {pendingUsers.map(user => (
        <div key={user.id} className="user-card">
          <h3>{user.name}</h3>
          <p>{user.role} - {user.organization}</p>
          <button onClick={() => approveUser(user.id)}>
            Approve
          </button>
        </div>
      ))}
    </div>
  );
};
```

### Product Recall System

```java
// Chaincode function for product recall
@Transaction(intent = Transaction.TYPE.SUBMIT)
public String initiateRecall(Context ctx, String recallData) {
    String clientMSPID = ctx.getClientIdentity().getMSPID();
    
    // Verify NMPB admin permissions
    if (!clientMSPID.equals("NMPBOrgMSP")) {
        throw new ChaincodeException("Only NMPB admins can initiate recalls");
    }
    
    RecallData data = genson.deserialize(recallData, RecallData.class);
    String recallId = "RECALL_" + System.currentTimeMillis();
    
    RecallNotice recall = new RecallNotice();
    recall.recallId = recallId;
    recall.batchId = data.batchId;
    recall.reason = data.reason;
    recall.status = "ACTIVE";
    
    // Store recall notice on ledger
    stub.putStringState("RECALL_" + recallId, genson.serialize(recall));
    
    // Emit recall event for notification system
    stub.setEvent("RecallInitiated", genson.serialize(recall).getBytes());
    
    return "Recall initiated successfully: " + recallId;
}
```

---

## 📈 System Metrics & Monitoring

### Fabric Operations Service

```yaml
# fabric-metrics.yaml
operations:
  listenAddress: 127.0.0.1:9443
  tls:
    enabled: false
metrics:
  provider: prometheus
  statsd:
    network: udp
    address: 127.0.0.1:8125
```

### Health Monitoring

```javascript
// System health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: checkDatabaseHealth(),
      blockchain: checkBlockchainHealth(),
      ipfs: checkIPFSHealth()
    },
    metrics: {
      totalTransactions: getTotalTransactions(),
      activeUsers: getActiveUsers(),
      networkLatency: getNetworkLatency()
    }
  });
});
```

---

## 🚀 Deployment Instructions

### Development Environment

```bash
# 1. Start Hyperledger Fabric Network
cd hyperledger
docker-compose up -d

# 2. Install and Instantiate Chaincode
./scripts/deploy-chaincode.sh

# 3. Start Backend Services
npm run server

# 4. Start Frontend Application
npm run dev

# 5. Access Application
# Web: http://localhost:3000
# Admin: http://localhost:3000/admin
# Consumer: http://localhost:3000/consumer
```

### Production Deployment

```bash
# Build production bundle
npm run build

# Deploy to cloud infrastructure
# (Requires cloud provider configuration)
./scripts/deploy-production.sh
```

---

## 📋 Testing Strategy

### Unit Testing

```bash
# Test smart contracts
cd chaincode/herbtraceability
./gradlew test

# Test React components
npm test

# Test API endpoints
npm run test:api
```

### Integration Testing

```javascript
// Example integration test
describe('Collection to Consumer Flow', () => {
  it('should complete full traceability journey', async () => {
    // 1. Record collection
    const collectionResult = await invokeChaincode('RecordCollectionEvent', testData);
    expect(collectionResult.success).toBe(true);
    
    // 2. Quality attestation
    const qualityResult = await invokeChaincode('QualityAttestation', qualityData);
    expect(qualityResult.success).toBe(true);
    
    // 3. Processing
    const processResult = await invokeChaincode('TransferCustody', processData);
    expect(processResult.success).toBe(true);
    
    // 4. Manufacturing
    const batchResult = await invokeChaincode('BatchCreation', batchData);
    expect(batchResult.success).toBe(true);
    
    // 5. Consumer verification
    const provenance = await queryChaincode('GetProvenance', [batchResult.batchId]);
    expect(provenance.data.journey).toHaveLength(4);
  });
});
```

---

## 🔧 Troubleshooting Guide

### Common Issues

1. **Docker Container Issues**
```bash
# Clean restart
docker-compose down
docker system prune -f
docker-compose up -d
```

2. **Chaincode Installation Errors**
```bash
# Reinstall chaincode
peer lifecycle chaincode package herbtraceability.tar.gz --path ./chaincode --lang java --label herbtraceability_1.0
peer lifecycle chaincode install herbtraceability.tar.gz
```

3. **IPFS Connection Issues**
```bash
# Check IPFS API availability
curl -X POST "https://ipfs.io/api/v0/version"
```

4. **Frontend Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 🎯 Demo Scenario (September 18, 2025)

### Pilot Implementation

**Participants**:
- 10 Rural Farmers (Rajasthan)
- 1 Quality Testing Lab
- 1 Processing Unit
- 1 Manufacturing Company
- 1 NMPB Administrator

**Demo Flow**:
1. **Registration**: 5 farmers register via mobile app
2. **Collection**: Record 20 Ashwagandha collections with GPS validation
3. **Quality Testing**: Lab processes 15 samples (12 pass, 3 fail)
4. **Processing**: Processor handles 10 approved batches
5. **Manufacturing**: Create 5 final product batches
6. **Consumer Verification**: Demonstrate portal with full traceability
7. **Admin Functions**: Show user management, zone updates, recall

**Expected Metrics**:
- 50+ blockchain transactions
- 100% GPS validation success
- 80% quality pass rate (realistic)
- Complete farm-to-consumer traceability for 5 products

---

## 📚 Additional Resources

### Documentation Links

- [Hyperledger Fabric Documentation](https://hyperledger-fabric.readthedocs.io/)
- [React.js Documentation](https://reactjs.org/docs/)
- [IPFS HTTP API](https://docs.ipfs.io/reference/http/api/)
- [Leaflet.js Documentation](https://leafletjs.com/)

### Training Materials

- Fabric Chaincode Development Guide
- React Component Development Patterns
- IPFS Integration Best Practices
- Mobile-First Design Principles

### Community Support

- **GitHub Issues**: Submit bug reports and feature requests
- **Documentation**: Comprehensive API documentation
- **Video Tutorials**: Step-by-step implementation guides
- **Community Forum**: Developer discussions and support

---

## 📄 License

This project is open-source under the **Apache 2.0 License**.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests for improvements.

---

**HERBIONYX** - Empowering Rural Farmers through Blockchain Technology 🌱

*Developed for demonstration on September 18, 2025*

---

## 🏃‍♂️ Quick Start Commands

```bash
# Complete system startup (one command)
npm run start-full

# Individual services
npm run start-network    # Hyperledger Fabric
npm run server          # Backend API
npm run dev             # Frontend React App
npm run install-chaincode  # Deploy smart contracts

# Demo login credentials
# Collector: collector1 / password123
# Lab Tech: labtech1 / password123  
# Processor: processor1 / password123
# Manufacturer: manufacturer1 / password123
# Admin: nmpb_admin / admin123
```

The system is now ready for your September 18, 2025 demonstration! 🚀