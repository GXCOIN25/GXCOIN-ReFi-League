import React from 'react';
import { useUser } from '@/lib/stores/useUser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, GitBranch, Star, GitFork, Eye, Calendar, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GitHubConnectProps {
  className?: string;
  showRepositories?: boolean;
}

export function GitHubConnect({ className, showRepositories = false }: GitHubConnectProps) {
  const {
    currentUser,
    githubProfile,
    githubRepositories,
    isGitHubConnected,
    isLoadingGitHub,
    githubError,
    handleGitHubConnection,
    completeGitHubOAuth,
    fetchGitHubProfile,
    fetchGitHubRepositories,
    setGitHubError
  } = useUser();

  // Check for OAuth callback on component mount
  React.useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const storedState = sessionStorage.getItem('github_oauth_state');
      
      if (code && state && storedState === state) {
        try {
          await completeGitHubOAuth(code, state);
        } catch (error) {
          console.error('OAuth callback failed:', error);
        }
      }
    };
    
    handleOAuthCallback();
  }, [completeGitHubOAuth]);

  const handleConnectGitHub = async () => {
    try {
      await handleGitHubConnection();
    } catch (error) {
      console.error('GitHub connection failed:', error);
    }
  };

  const handleFetchRepositories = async () => {
    try {
      await fetchGitHubRepositories();
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
    }
  };

  if (!currentUser) {
    return null;
  }

  if (!isGitHubConnected) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Connect GitHub
          </CardTitle>
          <CardDescription>
            Link your GitHub account to showcase your projects and contribute to the GXCOIN ecosystem
          </CardDescription>
        </CardHeader>
        <CardContent>
          {githubError && (
            <div className="mb-4 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{githubError}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setGitHubError(null)}
                className="mt-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                Dismiss
              </Button>
            </div>
          )}
          
          <Button 
            onClick={handleConnectGitHub}
            disabled={isLoadingGitHub}
            className="w-full"
          >
            {isLoadingGitHub ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <GitBranch className="mr-2 h-4 w-4" />
                Connect GitHub Account
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* GitHub Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            GitHub Profile
            <Badge variant="secondary" className="ml-auto">Connected</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {githubError && (
            <div className="mb-4 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{githubError}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setGitHubError(null)}
                className="mt-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                Dismiss
              </Button>
            </div>
          )}

          {isLoadingGitHub && !githubProfile ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading GitHub profile...</span>
            </div>
          ) : githubProfile ? (
            <div className="space-y-4">
              {/* Profile Header */}
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={githubProfile.avatarUrl} alt={githubProfile.username} />
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{githubProfile.name || githubProfile.username}</h3>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.open(githubProfile.profileUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">@{githubProfile.username}</p>
                  
                  {githubProfile.bio && (
                    <p className="text-sm">{githubProfile.bio}</p>
                  )}
                  
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{githubProfile.publicRepos} repos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{githubProfile.followers} followers</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{githubProfile.following} following</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Joined {new Date(githubProfile.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchGitHubProfile}
                  disabled={isLoadingGitHub}
                >
                  {isLoadingGitHub ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Refresh Profile'
                  )}
                </Button>
                
                {showRepositories && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFetchRepositories}
                    disabled={isLoadingGitHub}
                  >
                    {isLoadingGitHub ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      'Load Repositories'
                    )}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-4">
                GitHub profile information is not available
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchGitHubProfile}
                disabled={isLoadingGitHub}
              >
                {isLoadingGitHub ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  'Retry'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Repositories Card */}
      {showRepositories && githubRepositories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Recent Repositories
            </CardTitle>
            <CardDescription>
              Your latest GitHub repositories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {githubRepositories.slice(0, 5).map((repo) => (
                <div
                  key={repo.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card/50"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{repo.name}</h4>
                      {repo.private && (
                        <Badge variant="secondary" className="text-xs">Private</Badge>
                      )}
                    </div>
                    
                    {repo.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {repo.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {repo.language && (
                        <span>{repo.language}</span>
                      )}
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        <span>{repo.stargazersCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <GitFork className="h-3 w-3" />
                        <span>{repo.forksCount}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(repo.htmlUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            {githubRepositories.length > 5 && (
              <div className="mt-4 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(githubProfile?.profileUrl + '?tab=repositories', '_blank')}
                >
                  View all repositories
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}