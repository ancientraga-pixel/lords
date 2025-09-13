const axios = require('axios');
const FormData = require('form-data');

class IPFSService {
  constructor() {
    // Using Pinata (free tier: 1GB storage, 100 requests/month)
    this.pinataApiKey = process.env.PINATA_API_KEY;
    this.pinataSecretKey = process.env.PINATA_SECRET_API_KEY;
    this.pinataUrl = 'https://api.pinata.cloud';
    
    // Alternative: Web3.Storage (free tier: 1TB storage)
    this.web3StorageToken = process.env.WEB3_STORAGE_TOKEN;
    
    // Alternative: NFT.Storage (free tier: unlimited storage)
    this.nftStorageToken = process.env.NFT_STORAGE_TOKEN;
  }

  async uploadFile(fileBuffer, fileName, metadata = {}) {
    try {
      // Try Pinata first
      if (this.pinataApiKey && this.pinataSecretKey) {
        return await this.uploadToPinata(fileBuffer, fileName, metadata);
      }
      
      // Try Web3.Storage
      if (this.web3StorageToken) {
        return await this.uploadToWeb3Storage(fileBuffer, fileName, metadata);
      }
      
      // Try NFT.Storage
      if (this.nftStorageToken) {
        return await this.uploadToNFTStorage(fileBuffer, fileName, metadata);
      }
      
      // Fallback to mock hash
      return this.generateMockHash(fileName);
    } catch (error) {
      console.error('IPFS upload error:', error);
      return this.generateMockHash(fileName);
    }
  }

  async uploadToPinata(fileBuffer, fileName, metadata) {
    const formData = new FormData();
    formData.append('file', fileBuffer, fileName);
    
    const pinataMetadata = JSON.stringify({
      name: fileName,
      keyvalues: {
        ...metadata,
        uploadedAt: new Date().toISOString(),
        project: 'HERBIONYX'
      }
    });
    formData.append('pinataMetadata', pinataMetadata);

    const response = await axios.post(`${this.pinataUrl}/pinning/pinFileToIPFS`, formData, {
      headers: {
        ...formData.getHeaders(),
        'pinata_api_key': this.pinataApiKey,
        'pinata_secret_api_key': this.pinataSecretKey
      }
    });

    return {
      hash: response.data.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
      size: response.data.PinSize,
      provider: 'pinata'
    };
  }

  async uploadToWeb3Storage(fileBuffer, fileName, metadata) {
    const { Web3Storage, File } = require('web3.storage');
    const client = new Web3Storage({ token: this.web3StorageToken });
    
    const file = new File([fileBuffer], fileName, { type: 'application/octet-stream' });
    const cid = await client.put([file]);
    
    return {
      hash: cid,
      url: `https://${cid}.ipfs.w3s.link/${fileName}`,
      size: fileBuffer.length,
      provider: 'web3storage'
    };
  }

  async uploadToNFTStorage(fileBuffer, fileName, metadata) {
    const { NFTStorage, File } = require('nft.storage');
    const client = new NFTStorage({ token: this.nftStorageToken });
    
    const file = new File([fileBuffer], fileName, { type: 'application/octet-stream' });
    const cid = await client.storeBlob(file);
    
    return {
      hash: cid,
      url: `https://${cid}.ipfs.nftstorage.link`,
      size: fileBuffer.length,
      provider: 'nftstorage'
    };
  }

  async uploadJSON(jsonData, fileName) {
    try {
      const jsonString = JSON.stringify(jsonData);
      const buffer = Buffer.from(jsonString, 'utf8');
      return await this.uploadFile(buffer, fileName);
    } catch (error) {
      console.error('IPFS JSON upload error:', error);
      return this.generateMockHash(fileName);
    }
  }

  generateMockHash(fileName) {
    const mockHash = 'Qm' + Math.random().toString(36).substr(2, 44);
    return {
      hash: mockHash,
      url: `https://ipfs.io/ipfs/${mockHash}`,
      size: Math.floor(Math.random() * 1000000),
      provider: 'mock'
    };
  }

  async getFile(hash) {
    try {
      // Try different gateways
      const gateways = [
        `https://gateway.pinata.cloud/ipfs/${hash}`,
        `https://ipfs.io/ipfs/${hash}`,
        `https://cloudflare-ipfs.com/ipfs/${hash}`
      ];
      
      for (const gateway of gateways) {
        try {
          const response = await axios.get(gateway, { timeout: 5000 });
          return response.data;
        } catch (err) {
          continue;
        }
      }
      
      throw new Error('All IPFS gateways failed');
    } catch (error) {
      console.error('IPFS retrieval error:', error);
      throw error;
    }
  }
}

module.exports = new IPFSService();