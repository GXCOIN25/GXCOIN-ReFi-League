# ⚡ Quick Republish Checklist

## Before Republish:
```bash
./deploy.sh
```

## During Republish:
1. Click **"Republish"** in Publishing tab
2. ⏰ Wait for "Deployment successful" message

## After Republish (CRITICAL):
```
⏰ Wait 5-10 minutes for CDN refresh
🔄 Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
✅ Test: https://gxcoinheroes.com
```

## Why the Wait?
- **Preview:** Updates immediately (no CDN)
- **Live:** Updates after CDN refreshes (5-10 min)
- **This is normal** for all CDN-based hosting!

## Verify Cache-Busting:
```bash
./verify-cache-headers.sh
```

## Still Seeing Old Version?
1. ✅ Clear browser cache completely
2. ✅ Test in incognito/private window
3. ✅ Wait full 10 minutes
4. ✅ Check from different device/network

## See Full Guide:
- Technical details: `CACHE_FIX_GUIDE.md`
- Complete workflow: `REPUBLISH_GUIDE.md`
