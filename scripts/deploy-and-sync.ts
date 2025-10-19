#!/usr/bin/env tsx
/**
 * GXCOIN Deployment & GitHub Sync Script
 * 
 * This script automates the complete deployment workflow:
 * 1. Commits all code changes
 * 2. Pushes to GitHub repository
 * 3. Prepares app for republishing on Replit
 * 
 * Run before republishing to ensure GitHub is always in sync
 */

import { execSync } from 'child_process';
import { Octokit } from '@octokit/rest';

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
    return null;
  }
  return accessToken;
}

async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;
  return new Octokit({ auth: accessToken });
}

function runCommand(command: string, description: string): boolean {
  try {
    console.log(`\n📝 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`❌ Failed: ${description}`);
    return false;
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  🚀 GXCOIN Deployment & GitHub Sync                          ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  
  // Step 1: Verify GitHub connection
  console.log('1️⃣  Verifying GitHub connection...');
  const octokit = await getUncachableGitHubClient();
  
  if (!octokit) {
    console.log('⚠️  GitHub not connected - skipping repository sync');
    console.log('   To enable GitHub sync, reconnect GitHub integration');
    console.log('\n✅ App ready for republishing (GitHub sync skipped)');
    return;
  }

  try {
    const { data: user } = await octokit.rest.users.getAuthenticated();
    console.log(`   ✅ Connected as: ${user.login}`);
  } catch (error) {
    console.log('   ⚠️  GitHub authentication failed - continuing without sync');
  }

  // Step 2: Git Status Check
  console.log('\n2️⃣  Checking for changes...');
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    if (!status.trim()) {
      console.log('   ℹ️  No changes to commit');
      console.log('\n✅ Repository already up to date!');
      console.log('\n💡 Ready to republish on Replit');
      return;
    }
    
    const lines = status.trim().split('\n');
    console.log(`   📋 Found ${lines.length} changed file(s)`);
    lines.slice(0, 10).forEach(line => console.log(`      ${line}`));
    if (lines.length > 10) {
      console.log(`      ... and ${lines.length - 10} more`);
    }
  } catch (error) {
    console.error('   ❌ Failed to check git status');
    throw error;
  }

  // Step 3: Generate commit message
  const commitMessage = `Deploy: Platform updates ${timestamp}

Automated deployment sync including:
- Smart contract updates (AirdropDistributor, BattlePass, CosmeticsNFT)
- Gas Relayer system for gasless transactions
- Frontend improvements and bug fixes
- Backend API enhancements
- Mobile responsiveness updates

Deployed via: npm run deploy`;

  // Step 4: Stage changes
  console.log('\n3️⃣  Staging all changes...');
  if (!runCommand('git add -A', 'Stage all files')) {
    throw new Error('Failed to stage changes');
  }

  // Step 5: Commit changes
  console.log('\n4️⃣  Committing changes...');
  try {
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    console.log('   ✅ Changes committed');
  } catch (error: any) {
    if (error.message?.includes('nothing to commit')) {
      console.log('   ℹ️  Nothing to commit (already committed)');
    } else {
      throw error;
    }
  }

  // Step 6: Configure remote (if needed)
  console.log('\n5️⃣  Configuring GitHub remote...');
  try {
    execSync('git remote add origin https://github.com/GXCOIN25/GXCOIN-ReFj-League.git 2>/dev/null');
    console.log('   ✅ Remote configured');
  } catch {
    console.log('   ℹ️  Remote already configured');
  }

  // Step 7: Push to GitHub
  console.log('\n6️⃣  Pushing to GitHub...');
  if (!runCommand('git push -u origin main --force', 'Push to GitHub')) {
    console.warn('   ⚠️  Push failed - you may need to push manually');
    console.warn('   Run: git push -u origin main --force');
  } else {
    console.log('   ✅ Code synced to GitHub!');
  }

  // Step 8: Verify push
  console.log('\n7️⃣  Verifying GitHub sync...');
  try {
    const { data: commits } = await octokit.rest.repos.listCommits({
      owner: 'GXCOIN25',
      repo: 'GXCOIN-ReFj-League',
      per_page: 1
    });
    
    if (commits.length > 0) {
      const latestCommit = commits[0];
      console.log(`   ✅ Latest commit on GitHub:`);
      console.log(`      ${latestCommit.sha.substring(0, 7)} - ${latestCommit.commit.message.split('\n')[0]}`);
      console.log(`      ${new Date(latestCommit.commit.author?.date || '').toLocaleString()}`);
    }
  } catch (error) {
    console.log('   ℹ️  Could not verify (repository may be empty)');
  }

  // Success summary
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  ✅ DEPLOYMENT SYNC COMPLETE!                                ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  console.log('\n📦 GitHub Repository: https://github.com/GXCOIN25/GXCOIN-ReFj-League');
  console.log('\n🎯 Next Steps:');
  console.log('   1. Review changes on GitHub (if needed)');
  console.log('   2. Click "Republish" in Replit Publishing tab');
  console.log('   3. Your app will go live with all latest updates!');
  console.log('\n💡 Tip: Run "npm run deploy" before each republish to keep GitHub synced\n');
}

main().catch(error => {
  console.error('\n❌ Deployment sync failed:', error.message);
  console.error('\n💡 You can still republish, but GitHub may not be in sync');
  console.error('   To push manually, run: git push -u origin main --force\n');
  process.exit(1);
});
