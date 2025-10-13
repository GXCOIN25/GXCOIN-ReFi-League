# URGENT: CDN Cache Invalidation Request - Live Business Promotion Blocked

## Issue Summary
Our published Replit app at **gxcoinheros.com** is serving stale/cached code despite 30+ republish attempts over 7+ hours. A critical live business promotion is down, costing revenue and customers.

## Technical Details

### Repl Information
- **Published URL**: gxcoinheros.com
- **Preview URL**: https://0e0ed270-eebf-48f6-aeb7-3f28116e9d53-00-217wjbqdew0ol.janeway.replit.dev/
- **Workflow**: Start Game (npm run dev)
- **Framework**: React + Vite + Express
- **Issue Started**: ~7+ hours ago (October 13, 2025)

### Problem Description
1. **Code changes not deploying**: Multiple code fixes implemented but published site serves old JavaScript bundles
2. **Republish attempts failed**: Tried 30+ republishes, unpublish/republish cycles, service worker removal
3. **Preview works perfectly**: All fixes work in preview environment, confirming code is correct
4. **CDN cache suspected**: Replit's Static Deployment CDN appears to be aggressively caching old assets

### Evidence
- Preview URL console logs show latest code version
- Published site console logs show code from 7+ hours ago
- Service worker was disabled (lines 7, 41-48 in client/src/main.tsx)
- All JavaScript bundles appear cached at CDN level

### Specific Issues Blocked
1. Mobile touch event handlers not working (old code)
2. Demo mode error "No session ID found" (fix exists in new code)
3. Airdrop benefit buttons non-functional (mobile touch handlers missing)

### Files Modified (Not Deploying)
- client/src/main.tsx (service worker disabled)
- client/src/components/AirdropCampaignHub.tsx (mobile touch fixes)
- client/src/components/CryptoOnboardingHub.tsx (mobile touch fixes)
- client/src/components/PurchaseSuccess.tsx (demo mode fix)

## What We Need

### URGENT REQUEST
**Please invalidate/purge the CDN cache for gxcoinheros.com immediately**

This is blocking a live business promotion with real revenue impact.

### Alternative Solutions If CDN Purge Not Possible
1. Instructions for forcing CDN cache invalidation from our end
2. Alternative deployment method that bypasses CDN caching
3. Temporary subdomain (e.g., live.gxcoinheros.replit.app) with fresh deployment

## Workarounds Attempted
- ✅ Multiple republish attempts (30+)
- ✅ Unpublish → Wait → Republish cycle
- ✅ Service worker completely disabled
- ✅ Browser cache clearing (confirmed not browser-side issue)
- ✅ Hard refresh attempts
- ✅ Preview URL testing (works perfectly)

## Business Impact
- **Live promotion blocked**: Active marketing campaign directing users to broken site
- **Revenue loss**: Customers unable to complete airdrop claims and purchases
- **Reputational damage**: First-time crypto users seeing broken experience
- **Time-sensitive**: Promotion is time-limited

## Request Priority
**CRITICAL/URGENT** - Live business impact requiring immediate resolution

## Contact
Please respond via email or Replit in-app support ASAP.

---

## Technical Architecture (For Reference)

### Frontend
- React 18 + TypeScript
- Vite build system
- Radix UI components
- Tailwind CSS

### Backend
- Express.js + TypeScript
- PostgreSQL (Neon)
- Stripe integration
- JWT authentication

### Deployment
- Static Deployment (Vite build)
- Custom domain: gxcoinheros.com
- Server: Port 5000 (Express API)

### Current Build Output
```
dist/
  assets/
    index-[hash].js  // This is cached at CDN level
    index-[hash].css
  index.html         // Points to old hashed assets
```

The issue appears to be that the CDN is serving old hashed assets even after new builds are deployed.
