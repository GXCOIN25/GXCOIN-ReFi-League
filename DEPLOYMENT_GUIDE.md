# GXCOIN ReFi League - NFT Deployment Guide

This guide covers deploying smart contracts, configuring the application for production, and switching from demo mode to real blockchain NFT minting.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Smart Contract Deployment](#smart-contract-deployment)
3. [Configuration](#configuration)
4. [Switching from Demo to Production](#switching-from-demo-to-production)
5. [Testing Checklist](#testing-checklist)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools

- **Node.js** v18+ and npm
- **Hardhat** or **Foundry** for smart contract deployment
- **Wallet** with funds on target network(s)
- **RPC Provider** (Infura, Alchemy, or similar)
- **Block Explorer API Key** (Etherscan, Polygonscan, etc.)

### Required Accounts & Keys

1. **Deployer Wallet** - Private key with ETH/MATIC/BNB for gas fees
2. **Thirdweb Account** (optional) - For simplified SDK integration
3. **IPFS Storage** (Pinata, NFT.Storage) - For NFT metadata
4. **RPC Provider** (Infura/Alchemy) - For blockchain access

## Smart Contract Deployment

### Step 1: Prepare Smart Contracts

Ensure your smart contracts are ready:

```solidity
// HeroNFT.sol - ERC-721 contract for GXCOIN Heroes
contract HeroNFT is ERC721, Ownable {
    // Your hero NFT implementation
}

// GXCOINToken.sol - ERC-20 contract for GXCOIN
contract GXCOINToken is ERC20, Ownable {
    // Your token implementation
}
```

### Step 2: Deploy to Testnet First

#### Using Hardhat

```bash
# Install dependencies
npm install --save-dev hardhat @nomiclabs/hardhat-ethers

# Create deployment script
cat > scripts/deploy.js << 'EOF'
const hre = require("hardhat");

async function main() {
  // Deploy Hero NFT Contract
  const HeroNFT = await hre.ethers.getContractFactory("HeroNFT");
  const heroNFT = await HeroNFT.deploy();
  await heroNFT.deployed();
  console.log("HeroNFT deployed to:", heroNFT.address);

  // Deploy GXCOIN Token
  const GXCOINToken = await hre.ethers.getContractFactory("GXCOINToken");
  const gxcoinToken = await GXCOINToken.deploy();
  await gxcoinToken.deployed();
  console.log("GXCOIN deployed to:", gxcoinToken.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
EOF

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia
```

#### Deployment Networks

**Recommended Testnets:**
- **Sepolia** (Ethereum) - Most stable, best for testing
- **Mumbai** (Polygon) - Low gas fees, fast confirmations
- **BSC Testnet** - Alternative option

**Mainnet Networks (Production):**
- **Ethereum** - Highest security, highest fees
- **Polygon** - Low fees, fast, good liquidity
- **BNB Chain** - Low fees, large user base

### Step 3: Verify Contracts

```bash
# Verify on Etherscan (Sepolia)
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS

# Verify on Polygonscan (Mumbai)
npx hardhat verify --network mumbai DEPLOYED_CONTRACT_ADDRESS
```

### Step 4: Record Contract Addresses

Save the deployed contract addresses:

```
Sepolia Testnet:
- HeroNFT: 0x...
- GXCOIN: 0x...

Mumbai Testnet:
- HeroNFT: 0x...
- GXCOIN: 0x...
```

## Configuration

### Step 1: Update Environment Variables

Copy `.env.example` to `.env` and fill in your contract addresses:

```bash
# Copy example file
cp .env.example .env

# Edit with your values
nano .env
```

### Step 2: Configure Contract Addresses

Update `.env` with your deployed contract addresses:

```env
# Ethereum Sepolia Testnet
VITE_HERO_NFT_CONTRACT_SEPOLIA=0xYourSepoliaHeroNFTAddress
VITE_GXCOIN_TOKEN_SEPOLIA=0xYourSepoliaGXCOINAddress

# Polygon Mumbai Testnet
VITE_HERO_NFT_CONTRACT_MUMBAI=0xYourMumbaiHeroNFTAddress
VITE_GXCOIN_TOKEN_MUMBAI=0xYourMumbaiGXCOINAddress

# For production (mainnet), use these:
VITE_HERO_NFT_CONTRACT_ETHEREUM=0xYourMainnetHeroNFTAddress
VITE_GXCOIN_TOKEN_ETHEREUM=0xYourMainnetGXCOINAddress
```

### Step 3: Configure RPC Providers

Add your RPC provider credentials:

```env
# Infura (recommended)
VITE_INFURA_PROJECT_ID=your_infura_project_id

# Or Alchemy
VITE_ALCHEMY_API_KEY=your_alchemy_api_key
```

### Step 4: Setup IPFS Storage (Optional)

For NFT metadata storage:

```env
# Pinata IPFS
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key
```

## Switching from Demo to Production

### Current State: Demo Mode

By default, the application runs in **demo mode**:
- NFT badges stored in database
- Free to mint
- Instant creation
- No blockchain interaction (unless wallet connected)

### Enabling Production Mode

#### Option A: Gradual Rollout (Recommended)

Keep demo mode as default, allow users to opt-in to production:

```env
# Keep demo as default
VITE_NFT_MODE=demo

# But allow production minting for connected wallets
VITE_ENABLE_REAL_MINTING=true
```

With this configuration:
- Logged-in users without wallet = Demo mode
- Connected wallet users = Real blockchain NFTs
- Best of both worlds

#### Option B: Full Production Mode

Switch entire application to production:

```env
# Enable full production mode
VITE_NFT_MODE=production
VITE_ENABLE_REAL_MINTING=true
```

With this configuration:
- All NFT minting goes to blockchain
- Requires wallet connection
- Users pay gas fees

### Code Changes for Production

No code changes needed! The configuration automatically:

1. **Reads contract addresses** from environment variables
2. **Falls back to demo addresses** if not set
3. **Shows appropriate UI** based on mode (demo banner, etc.)
4. **Validates network** (testnet vs mainnet)

## Testing Checklist

### Before Production Deployment

#### 1. Testnet Testing

- [ ] Deploy contracts to testnet (Sepolia/Mumbai)
- [ ] Update `.env` with testnet contract addresses
- [ ] Test NFT minting on testnet
- [ ] Verify transactions on block explorer
- [ ] Test wallet connection (MetaMask, WalletConnect)
- [ ] Test network switching
- [ ] Verify NFT metadata displays correctly
- [ ] Test error handling (rejected transactions, etc.)

#### 2. Contract Verification

- [ ] All contracts verified on block explorer
- [ ] Contract source code matches deployed bytecode
- [ ] Contract ownership configured correctly
- [ ] Access controls (roles, permissions) set up
- [ ] Upgrade mechanisms (if applicable) tested

#### 3. Frontend Testing

- [ ] Demo mode works without wallet
- [ ] Production mode requires wallet connection
- [ ] Network validation works (blocks mainnet in demo mode)
- [ ] Gas estimation accurate
- [ ] Transaction tracking works
- [ ] Error messages user-friendly
- [ ] NFT collection displays correctly

#### 4. Security Checks

- [ ] Private keys never committed to code
- [ ] Environment variables properly configured
- [ ] Rate limiting on backend endpoints
- [ ] Contract permissions properly set
- [ ] Audit contracts (for mainnet)

#### 5. User Experience

- [ ] Clear explanation of demo vs production mode
- [ ] Transaction status visible to users
- [ ] Confirmation dialogs before transactions
- [ ] Success/error feedback clear
- [ ] Loading states during transactions

### Production Deployment Checklist

#### Before Mainnet Launch

- [ ] All testnet testing complete
- [ ] Smart contracts audited (recommended)
- [ ] Security review completed
- [ ] Gas optimization performed
- [ ] Documentation updated
- [ ] Support team trained
- [ ] Monitoring/alerting set up

#### Mainnet Deployment

1. **Deploy to mainnet** (Ethereum, Polygon, or BNB Chain)
2. **Verify contracts** on respective block explorers
3. **Update production environment variables**
4. **Test with small amounts** first
5. **Monitor initial transactions** closely
6. **Have rollback plan** ready

#### Post-Launch

- [ ] Monitor gas prices and transaction success rates
- [ ] Track user feedback
- [ ] Watch for contract errors
- [ ] Update documentation based on user issues
- [ ] Prepare for scaling if needed

## Troubleshooting

### Common Issues

#### "Contract not deployed on this network"

**Cause:** Missing contract address for current network
**Solution:** Add contract address to `.env` file for that network

```env
VITE_HERO_NFT_CONTRACT_SEPOLIA=0xYourContractAddress
```

#### "MAINNET BLOCKED" error

**Cause:** Demo mode doesn't allow mainnet minting
**Solution:** Either switch to production mode or use testnet

```env
VITE_NFT_MODE=production
VITE_ENABLE_REAL_MINTING=true
```

#### Transaction fails with "insufficient funds"

**Cause:** Not enough ETH/MATIC/BNB for gas
**Solution:** Add funds to wallet from faucet (testnet) or purchase (mainnet)

Testnet Faucets:
- Sepolia: https://sepoliafaucet.com
- Mumbai: https://faucet.polygon.technology
- BSC Testnet: https://testnet.binance.org/faucet-smart

#### NFT metadata not showing

**Cause:** IPFS gateway issue or metadata not uploaded
**Solution:** Check IPFS configuration and metadata format

```json
{
  "name": "AQUA Hero Level 1",
  "description": "Water Guardian NFT",
  "image": "ipfs://QmYourImageHash",
  "attributes": [...]
}
```

### Getting Help

- **GitHub Issues:** Report bugs and feature requests
- **Discord Community:** Get help from other developers
- **Documentation:** Check latest docs at docs.gxcoin.io
- **Support:** support@gxcoin.io

## Advanced Topics

### Using Thirdweb (When Compatible)

Once Thirdweb supports ethers v6:

1. Get Client ID from https://thirdweb.com/dashboard
2. Add to `.env`:
   ```env
   VITE_THIRDWEB_CLIENT_ID=your_client_id
   ```
3. See `client/src/lib/thirdweb/` for integration examples

### Custom Token Economics

Configure minting costs, royalties, and token utility:

```solidity
// In your smart contract
function setMintPrice(uint256 newPrice) external onlyOwner {
    mintPrice = newPrice;
}

function setRoyalty(uint96 feeNumerator) external onlyOwner {
    _setDefaultRoyalty(royaltyReceiver, feeNumerator);
}
```

### Scaling Considerations

For high-volume production:

1. **Layer 2 Solutions:** Consider Polygon, Arbitrum, or Optimism
2. **Batch Minting:** Implement bulk NFT minting
3. **Caching:** Cache NFT metadata and blockchain data
4. **Rate Limiting:** Prevent API abuse

## Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Ethers.js Documentation](https://docs.ethers.org)
- [GXCOIN Documentation](https://docs.gxcoin.io)

---

**Last Updated:** October 2025
**Version:** 1.0.0
**Maintainer:** GXCOIN Development Team
