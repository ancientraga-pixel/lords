const axios = require('axios');

class GeolocationService {
  constructor() {
    // Using OpenCellID (free API with registration)
    this.opencellIdApiKey = process.env.OPENCELLID_API_KEY;
    this.opencellIdUrl = 'https://opencellid.org/cell/get';
    
    // Alternative: Google Geolocation API (free tier: 40,000 requests/month)
    this.googleApiKey = process.env.GOOGLE_GEOLOCATION_API_KEY;
    this.googleUrl = 'https://www.googleapis.com/geolocation/v1/geolocate';
    
    // Alternative: Mozilla Location Service (completely free)
    this.mozillaUrl = 'https://location.services.mozilla.com/v1/geolocate';
    this.mozillaApiKey = process.env.MOZILLA_API_KEY; // Optional
  }

  // Get location using cell tower data for keypad phones
  async getCellTowerLocation(cellData) {
    try {
      const { mcc, mnc, lac, cellid } = cellData;
      
      // Try OpenCellID first
      if (this.opencellIdApiKey) {
        return await this.getLocationFromOpenCellID(cellData);
      }
      
      // Try Google Geolocation API
      if (this.googleApiKey) {
        return await this.getLocationFromGoogle(cellData);
      }
      
      // Try Mozilla Location Service (free)
      return await this.getLocationFromMozilla(cellData);
      
    } catch (error) {
      console.error('Cell tower location error:', error);
      return this.getMockLocation();
    }
  }

  async getLocationFromOpenCellID(cellData) {
    const { mcc, mnc, lac, cellid } = cellData;
    
    const response = await axios.get(this.opencellIdUrl, {
      params: {
        key: this.opencellIdApiKey,
        mcc: mcc,
        mnc: mnc,
        lac: lac,
        cellid: cellid,
        format: 'json'
      }
    });

    if (response.data && response.data.lat && response.data.lon) {
      return {
        latitude: parseFloat(response.data.lat),
        longitude: parseFloat(response.data.lon),
        accuracy: response.data.range || 1000,
        source: 'opencellid'
      };
    } else {
      throw new Error('No location data found');
    }
  }

  async getLocationFromGoogle(cellData) {
    const { mcc, mnc, lac, cellid } = cellData;
    
    const response = await axios.post(`${this.googleUrl}?key=${this.googleApiKey}`, {
      cellTowers: [{
        cellId: parseInt(cellid),
        locationAreaCode: parseInt(lac),
        mobileCountryCode: parseInt(mcc),
        mobileNetworkCode: parseInt(mnc)
      }]
    });

    if (response.data && response.data.location) {
      return {
        latitude: response.data.location.lat,
        longitude: response.data.location.lng,
        accuracy: response.data.accuracy || 1000,
        source: 'google'
      };
    } else {
      throw new Error('No location data found');
    }
  }

  async getLocationFromMozilla(cellData) {
    const { mcc, mnc, lac, cellid } = cellData;
    
    const requestData = {
      cellTowers: [{
        cellId: parseInt(cellid),
        locationAreaCode: parseInt(lac),
        mobileCountryCode: parseInt(mcc),
        mobileNetworkCode: parseInt(mnc)
      }]
    };

    const headers = { 'Content-Type': 'application/json' };
    if (this.mozillaApiKey) {
      headers['X-API-Key'] = this.mozillaApiKey;
    }

    const response = await axios.post(this.mozillaUrl, requestData, { headers });

    if (response.data && response.data.location) {
      return {
        latitude: response.data.location.lat,
        longitude: response.data.location.lng,
        accuracy: response.data.accuracy || 1000,
        source: 'mozilla'
      };
    } else {
      throw new Error('No location data found');
    }
  }

  // Mock location for demo purposes
  getMockLocation() {
    const mockLocations = [
      { latitude: 26.9124, longitude: 75.7873, name: 'Rajasthan Zone 1' },
      { latitude: 23.0225, longitude: 72.5714, name: 'Gujarat Zone 1' },
      { latitude: 19.0760, longitude: 72.8777, name: 'Maharashtra Zone 1' },
      { latitude: 12.9716, longitude: 77.5946, name: 'Karnataka Zone 1' },
      { latitude: 13.0827, longitude: 80.2707, name: 'Tamil Nadu Zone 1' }
    ];

    const randomLocation = mockLocations[Math.floor(Math.random() * mockLocations.length)];
    return {
      ...randomLocation,
      accuracy: 500,
      source: 'mock'
    };
  }

  // Validate if location is in permitted zone
  validatePermittedZone(latitude, longitude, permittedZones) {
    for (const zone of permittedZones) {
      if (this.isPointInZone(latitude, longitude, zone)) {
        return { valid: true, zone: zone.name };
      }
    }
    return { valid: false, zone: null };
  }

  isPointInZone(lat, lng, zone) {
    return lat >= zone.minLat && lat <= zone.maxLat && 
           lng >= zone.minLng && lng <= zone.maxLng;
  }
}

module.exports = new GeolocationService();