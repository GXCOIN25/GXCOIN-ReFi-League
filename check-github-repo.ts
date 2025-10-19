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

async function checkRepository() {
  console.log('🔍 Checking GitHub repository for updates...\n');
  
  const octokit = await getUncachableGitHubClient();
  const owner = 'GXCOIN25';
  const repo = 'GXCOIN-ReFj-League';
  
  try {
    // Check if repository has any commits
    const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
    console.log(`📦 Repository: ${repoData.full_name}`);
    console.log(`📅 Created: ${new Date(repoData.created_at).toLocaleString()}`);
    console.log(`📝 Description: ${repoData.description || 'No description'}`);
    console.log(`🌿 Default Branch: ${repoData.default_branch}`);
    
    try {
      // Try to get the default branch
      const { data: branch } = await octokit.rest.repos.getBranch({
        owner,
        repo,
        branch: repoData.default_branch
      });
      
      console.log(`\n✅ Branch exists with ${branch.commit.sha.substring(0, 7)} commit`);
      
      // Get repository contents
      const { data: contents } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: ''
      });
      
      console.log(`\n📁 Root Directory Files (${Array.isArray(contents) ? contents.length : 0} items):`);
      if (Array.isArray(contents)) {
        contents.forEach(item => {
          const icon = item.type === 'dir' ? '📂' : '📄';
          console.log(`   ${icon} ${item.name}`);
        });
      }
      
      // Look for smart contracts
      console.log(`\n🔍 Searching for Smart Contracts (.sol files)...`);
      let foundContracts = false;
      
      const searchPaths = ['', 'contracts', 'server/contracts', 'blockchain'];
      
      for (const path of searchPaths) {
        try {
          const { data: pathContents } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path
          });
          
          if (Array.isArray(pathContents)) {
            const solFiles = pathContents.filter(f => f.name.endsWith('.sol'));
            if (solFiles.length > 0) {
              console.log(`\n   Found in ${path || 'root'}:`);
              solFiles.forEach(file => {
                console.log(`   ✅ ${file.name}`);
                foundContracts = true;
              });
            }
          }
        } catch (e: any) {
          // Path doesn't exist, continue
        }
      }
      
      if (!foundContracts) {
        console.log(`   ⚠️  No .sol files found in repository`);
      }
      
      // Get recent commits
      const { data: commits } = await octokit.rest.repos.listCommits({
        owner,
        repo,
        per_page: 5
      });
      
      console.log(`\n📜 Recent Commits (${commits.length}):`);
      commits.forEach(commit => {
        const date = new Date(commit.commit.author?.date || '').toLocaleString();
        console.log(`   • ${commit.commit.message}`);
        console.log(`     ${commit.sha.substring(0, 7)} - ${date}`);
      });
      
    } catch (error: any) {
      if (error.status === 404) {
        console.log('\n⚠️  Repository is empty - no commits yet');
        console.log('\n💡 To push your code, run in Shell:');
        console.log('   git remote add origin https://github.com/GXCOIN25/GXCOIN-ReFj-League.git');
        console.log('   git branch -M main');
        console.log('   git push -u origin main');
      } else {
        throw error;
      }
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.status === 404) {
      console.log('Repository not found or not accessible');
    }
  }
}

checkRepository().catch(console.error);
