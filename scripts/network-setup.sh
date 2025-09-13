#!/bin/bash

# HERBIONYX Network Setup Script
# Sets up complete Hyperledger Fabric network for Ayurvedic herbs traceability

echo "🌿 Starting HERBIONYX Network Setup..."

# Create directory structure
mkdir -p hyperledger/organizations/{ordererOrganizations,peerOrganizations}
mkdir -p hyperledger/scripts
mkdir -p hyperledger/channel-artifacts

# Generate crypto material
echo "📋 Generating crypto material..."
cd hyperledger

# Generate certificates using cryptogen
cryptogen generate --config=crypto-config.yaml

# Generate genesis block
echo "🔗 Generating genesis block..."
configtxgen -profile HerbionyxOrdererGenesis -channelID system-channel -outputBlock ./channel-artifacts/genesis.block

# Generate channel configuration
echo "📦 Generating channel configuration..."
configtxgen -profile AyurvedaChannel -outputCreateChannelTx ./channel-artifacts/ayurveda-channel.tx -channelID ayurveda-channel

# Generate anchor peer transactions
configtxgen -profile AyurvedaChannel -outputAnchorPeersUpdate ./channel-artifacts/FarmersCoopMSPanchors.tx -channelID ayurveda-channel -asOrg FarmersCoopMSP
configtxgen -profile AyurvedaChannel -outputAnchorPeersUpdate ./channel-artifacts/LabsOrgMSPanchors.tx -channelID ayurveda-channel -asOrg LabsOrgMSP
configtxgen -profile AyurvedaChannel -outputAnchorPeersUpdate ./channel-artifacts/ProcessorsOrgMSPanchors.tx -channelID ayurveda-channel -asOrg ProcessorsOrgMSP
configtxgen -profile AyurvedaChannel -outputAnchorPeersUpdate ./channel-artifacts/ManufacturersOrgMSPanchors.tx -channelID ayurveda-channel -asOrg ManufacturersOrgMSP
configtxgen -profile AyurvedaChannel -outputAnchorPeersUpdate ./channel-artifacts/NMPBOrgMSPanchors.tx -channelID ayurveda-channel -asOrg NMPBOrgMSP

echo "🐳 Starting Docker containers..."
docker-compose up -d

# Wait for containers to start
echo "⏳ Waiting for network to initialize..."
sleep 30

echo "📡 Creating channel..."
# Create channel
peer channel create -o orderer.herbionyx.com:7050 -c ayurveda-channel -f ./channel-artifacts/ayurveda-channel.tx --tls true --cafile $ORDERER_CA

echo "🔗 Joining peers to channel..."
# Set environment variables for each organization and join channel
export CORE_PEER_LOCALMSPID="FarmersCoopMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=./organizations/peerOrganizations/farmers.herbionyx.com/peers/peer0.farmers.herbionyx.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=./organizations/peerOrganizations/farmers.herbionyx.com/users/Admin@farmers.herbionyx.com/msp
export CORE_PEER_ADDRESS=peer0.farmers.herbionyx.com:7051

peer channel join -b ayurveda-channel.block

# Repeat for other organizations...

echo "⚙️ Installing chaincode..."
# Package chaincode
peer lifecycle chaincode package herbtraceability.tar.gz --path ../chaincode/herbtraceability --lang java --label herbtraceability_1.0

# Install chaincode on all peers
peer lifecycle chaincode install herbtraceability.tar.gz

echo "✅ HERBIONYX Network setup completed!"
echo "🌐 Network is ready for demo on September 18, 2025"
echo "📊 Access the application at http://localhost:3000"

cd ..