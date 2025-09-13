import React, { createContext, useContext, useState } from 'react';

const BlockchainContext = createContext();

export function useBlockchain() {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
}

export function BlockchainProvider({ children }) {
  const [networkStatus, setNetworkStatus] = useState('connected');
  const [transactions, setTransactions] = useState([]);

  // Mock Hyperledger Fabric interactions
  const invokeChaincode = async (functionName, args) => {
    try {
      console.log(`Invoking chaincode function: ${functionName}`, args);
      
      // Simulate blockchain transaction
      const transaction = {
        id: `tx_${Date.now()}`,
        function: functionName,
        args: args,
        timestamp: new Date().toISOString(),
        status: 'success',
        blockNumber: Math.floor(Math.random() * 1000) + 1000
      };
      
      setTransactions(prev => [transaction, ...prev]);
      
      // Simulate API call to Fabric Gateway
      const response = await fetch('/api/fabric/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ function: functionName, args })
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Chaincode invocation error:', error);
      throw error;
    }
  };

  const queryChaincode = async (functionName, args) => {
    try {
      console.log(`Querying chaincode function: ${functionName}`, args);
      
      const response = await fetch('/api/fabric/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ function: functionName, args })
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Query failed');
      }
    } catch (error) {
      console.error('Chaincode query error:', error);
      throw error;
    }
  };

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

      if (response.ok) {
        const result = await response.json();
        return {
          hash: result.hash,
          url: `https://ipfs.io/ipfs/${result.hash}`
        };
      } else {
        throw new Error('IPFS upload failed');
      }
    } catch (error) {
      console.error('IPFS upload error:', error);
      throw error;
    }
  };

  const generateQR = async (data) => {
    try {
      const response = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
      });

      if (response.ok) {
        const result = await response.json();
        return result.qrCode;
      } else {
        throw new Error('QR generation failed');
      }
    } catch (error) {
      console.error('QR generation error:', error);
      throw error;
    }
  };

  const value = {
    networkStatus,
    transactions,
    invokeChaincode,
    queryChaincode,
    uploadToIPFS,
    generateQR
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
}