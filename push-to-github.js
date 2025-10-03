import { Octokit } from '@octokit/rest';
import fs from 'fs';
import path from 'path';

let connectionSettings;

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

async function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist' && file !== 'build') {
        await getAllFiles(filePath, fileList);
      }
    } else {
      if (!file.endsWith('.lock') && !file.endsWith('.tar.gz')) {
        fileList.push(filePath);
      }
    }
  }
  
  return fileList;
}

async function pushToGitHub() {
  console.log('🚀 Starting GitHub push...');
  
  const octokit = await getUncachableGitHubClient();
  const owner = 'GXCOIN25';
  const repo = 'GXCOIN-ReFi-League';
  
  console.log('📡 Getting current main branch commit...');
  let parentCommit = null;
  try {
    const ref = await octokit.git.getRef({
      owner,
      repo,
      ref: 'heads/main'
    });
    parentCommit = ref.data.object.sha;
    console.log(`Found existing commit: ${parentCommit.substring(0, 7)}`);
  } catch (err) {
    console.log('No existing commits found - creating initial commit');
  }
  
  console.log('📁 Getting all files...');
  const files = await getAllFiles('.');
  console.log(`Found ${files.length} files to push`);
  
  console.log('📦 Creating blobs for all files...');
  const blobs = [];
  for (const file of files) {
    const content = fs.readFileSync(file);
    const relativePath = file.startsWith('./') ? file.slice(2) : file;
    
    try {
      const blob = await octokit.git.createBlob({
        owner,
        repo,
        content: content.toString('base64'),
        encoding: 'base64'
      });
      
      blobs.push({
        path: relativePath,
        mode: '100644',
        type: 'blob',
        sha: blob.data.sha
      });
      
      if (blobs.length % 10 === 0) {
        console.log(`  Created ${blobs.length} blobs...`);
      }
    } catch (err) {
      console.error(`Error with file ${relativePath}:`, err.message);
    }
  }
  
  console.log('🌳 Creating tree...');
  const tree = await octokit.git.createTree({
    owner,
    repo,
    tree: blobs
  });
  
  console.log('💾 Creating commit...');
  const commit = await octokit.git.createCommit({
    owner,
    repo,
    message: 'Add GXCOIN ReFi League application from Replit',
    tree: tree.data.sha,
    parents: parentCommit ? [parentCommit] : []
  });
  
  console.log('🔄 Updating main branch...');
  try {
    await octokit.git.updateRef({
      owner,
      repo,
      ref: 'heads/main',
      sha: commit.data.sha,
      force: true
    });
  } catch (err) {
    console.log('Creating main branch...');
    await octokit.git.createRef({
      owner,
      repo,
      ref: 'refs/heads/main',
      sha: commit.data.sha
    });
  }
  
  console.log('✅ Successfully pushed to GitHub!');
  console.log(`🌐 View at: https://github.com/${owner}/${repo}`);
}

pushToGitHub().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
