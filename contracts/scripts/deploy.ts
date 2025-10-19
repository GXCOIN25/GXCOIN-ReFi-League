import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting GXCOIN Smart Contracts Deployment...\n");
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // Deploy AirdropDistributor
  console.log("📦 Deploying AirdropDistributor...");
  const AirdropDistributor = await ethers.getContractFactory("AirdropDistributor");
  const airdropDistributor = await AirdropDistributor.deploy();
  await airdropDistributor.waitForDeployment();
  const airdropAddress = await airdropDistributor.getAddress();
  console.log("✅ AirdropDistributor deployed to:", airdropAddress);

  // Deploy BattlePass
  console.log("\n📦 Deploying BattlePass...");
  const BattlePass = await ethers.getContractFactory("BattlePass");
  const battlePass = await BattlePass.deploy();
  await battlePass.waitForDeployment();
  const battlePassAddress = await battlePass.getAddress();
  console.log("✅ BattlePass deployed to:", battlePassAddress);

  // Deploy CosmeticsNFT
  console.log("\n📦 Deploying CosmeticsNFT...");
  const CosmeticsNFT = await ethers.getContractFactory("CosmeticsNFT");
  const cosmeticsNFT = await CosmeticsNFT.deploy();
  await cosmeticsNFT.waitForDeployment();
  const cosmeticsAddress = await cosmeticsNFT.getAddress();
  console.log("✅ CosmeticsNFT deployed to:", cosmeticsAddress);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📋 Contract Addresses:");
  console.log("   AirdropDistributor:", airdropAddress);
  console.log("   BattlePass:", battlePassAddress);
  console.log("   CosmeticsNFT:", cosmeticsAddress);
  console.log("\n💾 Add these to your .env file:");
  console.log(`   VITE_AIRDROP_CONTRACT=${airdropAddress}`);
  console.log(`   VITE_BATTLEPASS_CONTRACT=${battlePassAddress}`);
  console.log(`   VITE_COSMETICS_CONTRACT=${cosmeticsAddress}`);
  console.log("\n" + "=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
