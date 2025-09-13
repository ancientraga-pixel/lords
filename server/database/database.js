const fs = require('fs');
const path = require('path');

class Database {
  constructor() {
    this.dataDir = path.join(__dirname, '../../data');
    this.dbPath = path.join(this.dataDir, 'herbionyx.json');
    this.ensureDataDirectory();
    this.initializeDatabase();
  }

  ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  initializeDatabase() {
    if (!fs.existsSync(this.dbPath)) {
      const initialData = {
        users: [],
        permittedZones: [
          {
            id: 'zone_1',
            name: 'Rajasthan Zone 1',
            minLat: 26.9124,
            minLng: 75.7873,
            maxLat: 27.2124,
            maxLng: 76.0873,
            maxYield: 500,
            active: true
          },
          {
            id: 'zone_2',
            name: 'Gujarat Zone 1',
            minLat: 23.0225,
            minLng: 72.5714,
            maxLat: 23.3225,
            maxLng: 72.8714,
            maxYield: 400,
            active: true
          },
          {
            id: 'zone_3',
            name: 'Maharashtra Zone 1',
            minLat: 19.0760,
            minLng: 72.8777,
            maxLat: 19.3760,
            maxLng: 73.1777,
            maxYield: 600,
            active: true
          }
        ],
        permittedHerbs: [
          {
            id: 'herb_1',
            name: 'Ashwagandha',
            scientificName: 'Withania somnifera',
            seasonStart: 'October',
            seasonEnd: 'March',
            maxYieldPerCollection: 50,
            qualityStandards: {
              moisture: { max: 12, unit: '%' },
              pesticides: { max: 0.01, unit: 'mg/kg' },
              heavyMetals: { max: 10, unit: 'ppm' }
            },
            active: true
          },
          {
            id: 'herb_2',
            name: 'Turmeric',
            scientificName: 'Curcuma longa',
            seasonStart: 'January',
            seasonEnd: 'April',
            maxYieldPerCollection: 75,
            qualityStandards: {
              moisture: { max: 10, unit: '%' },
              pesticides: { max: 0.01, unit: 'mg/kg' },
              heavyMetals: { max: 10, unit: 'ppm' }
            },
            active: true
          }
        ],
        collections: [],
        qualityTests: [],
        processings: [],
        batches: [],
        qrCodes: []
      };
      
      this.saveData(initialData);
    }
  }

  loadData() {
    try {
      const data = fs.readFileSync(this.dbPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Database load error:', error);
      return null;
    }
  }

  saveData(data) {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Database save error:', error);
      return false;
    }
  }

  // Permitted Zones Management
  getPermittedZones() {
    const data = this.loadData();
    return data ? data.permittedZones.filter(zone => zone.active) : [];
  }

  addPermittedZone(zone) {
    const data = this.loadData();
    if (!data) return false;

    const newZone = {
      id: `zone_${Date.now()}`,
      ...zone,
      active: true,
      createdAt: new Date().toISOString()
    };

    data.permittedZones.push(newZone);
    return this.saveData(data);
  }

  updatePermittedZone(zoneId, updates) {
    const data = this.loadData();
    if (!data) return false;

    const zoneIndex = data.permittedZones.findIndex(zone => zone.id === zoneId);
    if (zoneIndex === -1) return false;

    data.permittedZones[zoneIndex] = {
      ...data.permittedZones[zoneIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.saveData(data);
  }

  deletePermittedZone(zoneId) {
    const data = this.loadData();
    if (!data) return false;

    const zoneIndex = data.permittedZones.findIndex(zone => zone.id === zoneId);
    if (zoneIndex === -1) return false;

    data.permittedZones[zoneIndex].active = false;
    data.permittedZones[zoneIndex].deletedAt = new Date().toISOString();

    return this.saveData(data);
  }

  // Permitted Herbs Management
  getPermittedHerbs() {
    const data = this.loadData();
    return data ? data.permittedHerbs.filter(herb => herb.active) : [];
  }

  addPermittedHerb(herb) {
    const data = this.loadData();
    if (!data) return false;

    const newHerb = {
      id: `herb_${Date.now()}`,
      ...herb,
      active: true,
      createdAt: new Date().toISOString()
    };

    data.permittedHerbs.push(newHerb);
    return this.saveData(data);
  }

  updatePermittedHerb(herbId, updates) {
    const data = this.loadData();
    if (!data) return false;

    const herbIndex = data.permittedHerbs.findIndex(herb => herb.id === herbId);
    if (herbIndex === -1) return false;

    data.permittedHerbs[herbIndex] = {
      ...data.permittedHerbs[herbIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.saveData(data);
  }

  deletePermittedHerb(herbId) {
    const data = this.loadData();
    if (!data) return false;

    const herbIndex = data.permittedHerbs.findIndex(herb => herb.id === herbId);
    if (herbIndex === -1) return false;

    data.permittedHerbs[herbIndex].active = false;
    data.permittedHerbs[herbIndex].deletedAt = new Date().toISOString();

    return this.saveData(data);
  }

  // QR Code Chain Management
  saveQRCode(qrData) {
    const data = this.loadData();
    if (!data) return false;

    data.qrCodes.push({
      id: qrData.id,
      data: qrData,
      createdAt: new Date().toISOString()
    });

    return this.saveData(data);
  }

  getQRChain(qrId) {
    const data = this.loadData();
    if (!data) return null;

    return data.qrCodes.find(qr => qr.id === qrId);
  }
}

module.exports = new Database();