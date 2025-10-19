# 🚀 GXCOIN Republishing Guide

This guide explains how to republish your GXCOIN platform with automatic GitHub synchronization.

## Quick Republish Workflow

### Option 1: Automated (Recommended)

Run the deployment script before republishing:

```bash
./deploy.sh
```

OR

```bash
npx tsx scripts/deploy-and-sync.ts
```

**What it does:**
1. ✅ Commits all code changes
2. ✅ Pushes to GitHub (https://github.com/GXCOIN25/GXCOIN-ReFj-League)
3. ✅ Verifies sync status
4. ✅ Prepares app for republishing

**Then:**
- Go to **Publishing** tab in Replit
- Click **"Republish"**
- Done! Your app is live with latest changes

---

### Option 2: Manual GitHub Sync

If the automated script doesn't work:

```bash
git add -A
git commit -m "Platform updates $(date +%Y-%m-%d)"
git push -u origin main --force
```

Then republish on Replit.

---

## What Gets Synced to GitHub

✅ **Smart Contracts:**
- AirdropDistributor.sol - Token distribution system
- BattlePass.sol - NFT Battle Pass
- CosmeticsNFT.sol - Cosmetic items (ERC1155)

✅ **Deployment Infrastructure:**
- Hardhat configuration
- Deployment scripts
- Gas Relayer system

✅ **Full Platform Code:**
- React frontend (Battle Pass, NFT minting, etc.)
- Express.js backend
- Database schemas
- All recent fixes and improvements

✅ **Configuration:**
- Environment variable templates
- Deployment guides
- Documentation

---

## Deployment Checklist

Before republishing, ensure:

- [ ] Run deployment script: `./deploy.sh`
- [ ] Verify GitHub sync completed successfully
- [ ] Check for any critical errors in logs
- [ ] Test major features locally if needed
- [ ] Click "Republish" in Replit Publishing tab

---

## After Republishing

Your changes will be live at:
- **Production:** https://gxcoinheroes.com
- **Replit URL:** https://gx-coin-heroes-gxcoinworld.replit.app

**GitHub Repository:** https://github.com/GXCOIN25/GXCOIN-ReFj-League

---

## Troubleshooting

### "Git push failed"
Run manually:
```bash
git push -u origin main --force
```

### "GitHub not connected"
The deployment script will skip GitHub sync but you can still republish.
Reconnect GitHub integration in Replit if needed.

### "Changes already committed"
No problem! The script will push existing commits to GitHub.

---

## Smart Contract Deployment

Smart contracts are deployed separately to blockchain:

```bash
cd contracts
npm run deploy:polygon    # Deploy to Polygon mainnet
npm run deploy:sepolia    # Deploy to Sepolia testnet
```

**Note:** Requires `PRIVATE_KEY` and `POLYGON_RPC_URL` secrets.

---

## Support

- Platform docs: See `DEPLOYMENT_GUIDE.md`
- Smart contracts: See `contracts/` folder
- GitHub repo: https://github.com/GXCOIN25/GXCOIN-ReFj-League
