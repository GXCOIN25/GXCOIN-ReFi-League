#!/bin/bash
# Verify Cache Headers are Working
# Run this after republishing to check if cache-busting is active

echo "🔍 Verifying Cache-Busting Headers on gxcoinheroes.com"
echo "=================================================="
echo ""

echo "1️⃣  Checking live site cache headers..."
echo ""

# Check main HTML page
echo "📄 Main page (/):"
curl -sI https://gxcoinheroes.com/ | grep -i "cache-control\|pragma\|expires" || echo "   ⚠️  No cache headers found"
echo ""

# Check API endpoint
echo "📡 API endpoint (/api/airdrops/campaigns):"
curl -sI https://gxcoinheroes.com/api/airdrops/campaigns | grep -i "cache-control\|pragma\|expires" || echo "   ⚠️  No cache headers found"
echo ""

echo "=================================================="
echo "✅ If you see 'Cache-Control: no-cache, no-store' above, cache-busting is ACTIVE!"
echo "⚠️  If you see '404' or no headers, the site may still be deploying (wait 2-5 min)"
echo ""
echo "🔄 After republishing:"
echo "   1. Wait 5-10 minutes for CDN refresh"
echo "   2. Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)"
echo "   3. Test in incognito window"
echo ""
