import React from 'react';
import { AlertTriangle, RefreshCw, Smartphone, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CacheClearingGuideProps {
  onClose?: () => void;
}

export function CacheClearingGuide({ onClose }: CacheClearingGuideProps) {
  const userAgent = navigator.userAgent.toLowerCase();
  const isChrome = userAgent.includes('chrome') && !userAgent.includes('edg');
  const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');
  const isFirefox = userAgent.includes('firefox');
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

  return (
    <Card className="bg-gray-900 border-yellow-500/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-yellow-400 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Button Not Working? Quick Fix
          </CardTitle>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-yellow-900/20 border-yellow-500/50">
          <Smartphone className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-200">
            Your browser may have cached an old version. Clear your cache to fix this.
          </AlertDescription>
        </Alert>

        {/* Chrome Instructions */}
        {isChrome && (
          <div className="space-y-3">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-green-400" />
              Chrome Instructions:
            </h3>
            <ol className="space-y-2 text-gray-300 text-sm ml-6 list-decimal">
              <li>Tap the <strong>three dots (⋮)</strong> in the top right corner</li>
              <li>Tap <strong>"Settings"</strong></li>
              <li>Scroll down and tap <strong>"Privacy and security"</strong></li>
              <li>Tap <strong>"Clear browsing data"</strong></li>
              <li>Select <strong>"Cached images and files"</strong> (uncheck other options)</li>
              <li>Tap <strong>"Clear data"</strong></li>
              <li>Close Chrome completely from app switcher</li>
              <li>Reopen and try again</li>
            </ol>
          </div>
        )}

        {/* Safari Instructions */}
        {isSafari && (
          <div className="space-y-3">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-blue-400" />
              Safari Instructions:
            </h3>
            <ol className="space-y-2 text-gray-300 text-sm ml-6 list-decimal">
              <li>Open <strong>Settings</strong> app on your device</li>
              <li>Scroll down and tap <strong>"Safari"</strong></li>
              <li>Scroll down and tap <strong>"Clear History and Website Data"</strong></li>
              <li>Confirm by tapping <strong>"Clear History and Data"</strong></li>
              <li>Return to Safari and try again</li>
            </ol>
          </div>
        )}

        {/* Firefox Instructions */}
        {isFirefox && (
          <div className="space-y-3">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-orange-400" />
              Firefox Instructions:
            </h3>
            <ol className="space-y-2 text-gray-300 text-sm ml-6 list-decimal">
              <li>Tap the <strong>three dots (⋯)</strong> menu</li>
              <li>Tap <strong>"Settings"</strong></li>
              <li>Tap <strong>"Delete browsing data"</strong></li>
              <li>Select <strong>"Cached images and files"</strong></li>
              <li>Tap <strong>"Delete browsing data"</strong></li>
              <li>Restart Firefox and try again</li>
            </ol>
          </div>
        )}

        {/* Generic Mobile Instructions */}
        {isMobile && !isChrome && !isSafari && !isFirefox && (
          <div className="space-y-3">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-purple-400" />
              Mobile Browser Instructions:
            </h3>
            <ol className="space-y-2 text-gray-300 text-sm ml-6 list-decimal">
              <li>Open your browser's <strong>menu</strong> (usually ⋮ or ⋯)</li>
              <li>Find <strong>"Settings"</strong> or <strong>"History"</strong></li>
              <li>Look for <strong>"Clear browsing data"</strong> or <strong>"Clear cache"</strong></li>
              <li>Select <strong>"Cached images and files"</strong></li>
              <li>Clear the data</li>
              <li>Close and restart your browser</li>
              <li>Try the button again</li>
            </ol>
          </div>
        )}

        {/* Desktop Instructions */}
        {!isMobile && (
          <div className="space-y-3">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-indigo-400" />
              Desktop Quick Fix:
            </h3>
            <ol className="space-y-2 text-gray-300 text-sm ml-6 list-decimal">
              <li>Press <strong>Ctrl + Shift + R</strong> (Windows) or <strong>Cmd + Shift + R</strong> (Mac)</li>
              <li>This forces a hard refresh and clears the cache</li>
              <li>Alternatively, open Developer Tools (F12), right-click the refresh button, select "Empty Cache and Hard Reload"</li>
            </ol>
          </div>
        )}

        <div className="pt-4 border-t border-gray-700">
          <Button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            I've Cleared Cache - Reload Now
          </Button>
        </div>

        <p className="text-xs text-gray-400 text-center">
          Still not working? Try using a different browser or device.
        </p>
      </CardContent>
    </Card>
  );
}
