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
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

async function createRepository() {
  console.log('🚀 Creating GitHub repository...');
  
  const octokit = await getUncachableGitHubClient();
  const repoName = 'GXCOIN-ReFj-League';
  
  try {
    const { data: repo } = await octokit.rest.repos.createForAuthenticatedUser({
      name: repoName,
      description: 'GXCOIN ReFi League - Interactive superhero-themed platform for regenerative finance with NFT minting, Battle Pass, and viral airdrops',
      private: false,
      auto_init: false,
    });
    
    console.log(`✅ Repository created successfully!`);
    console.log(`   URL: ${repo.html_url}`);
    console.log(`   Clone URL: ${repo.clone_url}`);
    
    return repo;
  } catch (error: any) {
    console.error('❌ Error creating repository:', error.message);
    if (error.status === 422) {
      console.log('ℹ️  Repository might already exist. Checking...');
      try {
        const { data: existingRepo } = await octokit.rest.repos.get({
          owner: 'GXCOIN25',
          repo: repoName
        });
        console.log(`✅ Repository already exists: ${existingRepo.html_url}`);
        return existingRepo;
      } catch (e) {
        throw error;
      }
    }
    throw error;
  }
}

createRepository().catch(console.error);
