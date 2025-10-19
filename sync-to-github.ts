import { Octokit } from '@octokit/rest';
import { promises as fs } from 'fs';
import path from 'path';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

async function syncToGitHub() {
  console.log('🚀 Syncing updates to GitHub...\n');
  
  const octokit = await getUncachableGitHubClient();
  const owner = 'GXCOIN25';
  const repo = 'GXCOIN-ReFj-League';
  
  console.log('📋 Recent Updates to Push:');
  console.log('   ✅ Smart Contract deployment scripts (contracts/scripts/deploy.ts)');
  console.log('   ✅ Gas Relayer system (server/blockchain/relayer.ts)');
  console.log('   ✅ Hardhat configuration (contracts/hardhat.config.ts)');
  console.log('   ✅ Mobile touch event fixes (PurchaseSuccess.tsx)');
  console.log('   ✅ Domain redirect removal (client/index.html)');
  console.log('   ✅ All 3 smart contracts (AirdropDistributor, BattlePass, CosmeticsNFT)');
  
  console.log('\n⚠️  To complete the push to GitHub, please run these commands in the Shell:\n');
  console.log('1️⃣  git add -A');
  console.log('2️⃣  git commit -m "Add smart contract deployment & gas relayer system"');
  console.log('3️⃣  git remote add origin https://github.com/GXCOIN25/GXCOIN-ReFj-League.git 2>/dev/null || true');
  console.log('4️⃣  git push -u origin main --force');
  
  console.log('\n📦 Repository: https://github.com/GXCOIN25/GXCOIN-ReFj-League');
  console.log('\n💡 Copy and paste these commands into the Shell (bottom of screen) to push your code!');
}

syncToGitHub().catch(console.error);
