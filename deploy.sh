#!/bin/bash
# GXCOIN Deployment & GitHub Sync Script
# Run this before republishing to sync all changes to GitHub

echo "🚀 Starting GXCOIN Deployment & GitHub Sync..."
echo ""

npx tsx scripts/deploy-and-sync.ts

echo ""
echo "✅ Done! Ready to republish on Replit."
