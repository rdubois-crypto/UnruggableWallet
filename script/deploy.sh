#deployment script
#!/bin/bash

# Configuration
CONTRACT_NAME="SCLBIP3277702"   
PRIVATE_KEY="fill with your own, then delete" 

# Deploy to networks
echo "Deploying $CONTRACT_NAME with Forge..."
#!/bin/bash

# Configuration
CONTRACT_NAME="YourContractName"   # Replace with your contract name
PRIVATE_KEY="0xYourPrivateKeyHere" # Replace with your private key

# Deploy to networks
echo "Deploying $CONTRACT_NAME with Forge..."

# Mekong Testnet
echo "Deploying to Mekong Testnet..."
forge create $CONTRACT_NAME \
    --rpc-url https://rpc.mekong.ethpandaops.io \
    --chain-id 7078815900 \
    --private-key $PRIVATE_KEY
echo "Mekong Testnet deployed."

# Arbitrum Sepolia Testnet
echo "Deploying to Arbitrum Sepolia Testnet..."
forge create $CONTRACT_NAME \
    --rpc-url https://endpoints.omniatech.io/v1/arbitrum/sepolia/public \
    --chain-id 421614 \
    --private-key $PRIVATE_KEY
echo "Arbitrum Sepolia Testnet deployed."

# Polygon Amoy
echo "Deploying to Polygon Amoy..."
forge create $CONTRACT_NAME \
    --rpc-url https://polygon-amoy.drpc.org \
    --chain-id 80002 \
    --private-key $PRIVATE_KEY
echo "Polygon Amoy deployed."

# Base Sepolia Testnet
echo "Deploying to Base Sepolia Testnet..."
forge create $CONTRACT_NAME \
    --rpc-url wss://base-sepolia-rpc.publicnode.com \
    --chain-id 84532 \
    --private-key $PRIVATE_KEY
echo "Base Sepolia Testnet deployed."

# Scroll Sepolia Testnet
echo "Deploying to Scroll Sepolia Testnet..."
forge create $CONTRACT_NAME \
    --rpc-url wss://scroll-sepolia-rpc.publicnode.com \
    --chain-id 534351 \
    --private-key $PRIVATE_KEY
echo "Scroll Sepolia Testnet deployed."

# CELO Alfajores Testnet
echo "Deploying to CELO Alfajores Testnet..."
forge create $CONTRACT_NAME \
    --rpc-url wss://alfajores-forno.celo-testnet.org/ws \
    --chain-id 44787 \
    --private-key $PRIVATE_KEY
echo "CELO Alfajores Testnet deployed."

# Mantle Testnet
echo "Deploying to Mantle Testnet..."
forge create $CONTRACT_NAME \
    --rpc-url https://rpc.sepolia.mantle.xyz \
    --chain-id 5003 \
    --private-key $PRIVATE_KEY
echo "Mantle Testnet deployed."

# Linea Sepolia
echo "Deploying to Linea Sepolia..."
forge create $CONTRACT_NAME \
    --rpc-url wss://linea-sepolia-rpc.publicnode.com \
    --chain-id 59141 \
    --private-key $PRIVATE_KEY
echo "Linea Sepolia deployed."

echo "Deployment script completed."
