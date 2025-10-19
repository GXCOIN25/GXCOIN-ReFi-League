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

async function pushToGitHub() {
  console.log('🚀 Starting GitHub push process...');
  
  const octokit = await getUncachableGitHubClient();
  const owner = 'GXCOIN25';
  const repo = 'GXCOIN-ReFj-League';
  
  try {
    // Get authenticated user info
    const { data: user } = await octokit.rest.users.getAuthenticated();
    console.log(`✅ Authenticated as: ${user.login}`);
    
    // Check if repository exists
    try {
      const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
      console.log(`✅ Repository found: ${repoData.full_name}`);
      console.log(`   Default branch: ${repoData.default_branch}`);
    } catch (error: any) {
      if (error.status === 404) {
        console.log('❌ Repository not found. Please create it first on GitHub.');
        console.log(`   Go to: https://github.com/new`);
        console.log(`   Repository name: ${repo}`);
        return;
      }
      throw error;
    }
    
    console.log('\n📝 Recent commits to push:');
    console.log('   1. Fix Epic Journey Tour NFT claiming buttons (mobile touch support)');
    console.log('   2. Add domain redirect for gxcoinheroes.com');
    console.log('   3. Fix mobile touch events for all buttons');
    
    console.log('\n✅ GitHub connection verified successfully!');
    console.log('\n⚠️  To complete the push, please run these commands in the Shell:');
    console.log('   1. git remote add origin https://github.com/GXCOIN25/GXCOIN-ReFj-League.git');
    console.log('   2. git branch -M main');
    console.log('   3. git push -u origin main --force');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.status === 401) {
      console.error('   Authentication failed. Please reconnect your GitHub integration.');
    }
  }
}

pushToGitHub().catch(console.error);
