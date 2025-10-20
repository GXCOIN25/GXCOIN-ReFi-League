# GXCOIN Eco-Warrior Platform

## Overview
GXCOIN is an interactive, superhero-themed platform for regenerative finance (ReFi) that gamifies environmental impact. It allows users to create eco-warrior profiles, contribute to environmental causes, earn dynamic NFT badges, and track real impact metrics while progressing through ranks. The platform integrates Web3 wallet connectivity, token economics, and community features to foster engagement in environmental action. The business vision is to leverage gamification and Web3 to drive significant real-world environmental contributions and establish a leading platform in the ReFi space.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Updates

### 🔐 Prominent Login/Signup System (October 20, 2025 - Latest)
- **CRITICAL FIX: Added Standalone Login Button to Airdrops Page**:
  * Problem: Users had NO visible way to create accounts or login on published site
  * Root cause: `onOpenLogin` callback not triggering reliably in production
  * **Solution: Prominent "Create Account / Login" button**:
    - Large, animated call-to-action at top of Airdrop Campaign Hub
    - Only visible when user is NOT logged in (disappears after login)
    - Green gradient design with animated gift icon for maximum visibility
    - Clear messaging: "No crypto wallet needed • Free to join • Instant access"
    - Full mobile touch support with onTouchEnd handlers
  * **Triple-Fallback Login System**:
    - Primary: Uses onOpenLogin callback prop
    - Fallback 1: Dispatches custom 'openLoginModal' event (caught by App.tsx listener)
    - Fallback 2: DOM manipulation to find and click login trigger
    - Fallback 3: User-friendly error message with refresh instruction
  * **Mobile Touch Enhancements**:
    - Added onTouchEnd to all airdrop benefit cards (Visa Card, Arena, Platinum, 10% OFF)
    - Added onTouchEnd to "Claim Now" limited time bonus button
    - Added onTouchEnd to "Generate Referral Link" and Copy buttons
  * Complete console logging for debugging login flow issues
- **Impact**: Users can now easily find and click login button to create accounts and claim airdrops

### 🚀 Automated Deployment & GitHub Sync (October 19, 2025)
- **Automated Deployment Script**: Created `scripts/deploy-and-sync.ts` for one-command deployment
  * Automatically commits all code changes
  * Pushes to GitHub repository (GXCOIN25/GXCOIN-ReFj-League)
  * Verifies sync and provides deployment status
  * Run before republishing: `npx tsx scripts/deploy-and-sync.ts`
- **CDN Cache-Busting Fix (CRITICAL PRODUCTION FIX)**:
  * Problem: Updates showed in preview but NOT live on gxcoinheroes.com
  * Root cause: Replit's CDN caches static assets for 5-10 minutes
  * Solution implemented: Cache-control headers at HTML and server level
  * Added cache-busting meta tags to index.html (no-cache, must-revalidate)
  * Added Express middleware for aggressive cache control on HTML/API
  * Static assets (JS/CSS/images) cached for 5 minutes only
  * **Workflow**: Republish → Wait 5-10 min → Hard refresh browser (Ctrl+Shift+R)
  * Verification script: `./verify-cache-headers.sh`
  * Complete guide: `CACHE_FIX_GUIDE.md`
- **Smart Contract Deployment Infrastructure**:
  * Hardhat configuration for Polygon and Sepolia networks
  * Deployment scripts for AirdropDistributor, BattlePass, CosmeticsNFT
  * Gas Relayer system for gasless user transactions (platform covers fees)
  * All contracts use OpenZeppelin security standards
- **GitHub Integration**: Full repository sync with automated commit messages
- **Deployment Workflow**: 
  1. Run `./deploy.sh` to sync GitHub
  2. Click "Republish" in Replit Publishing tab
  3. Wait 5-10 minutes for CDN refresh
  4. Hard refresh browser to see updates live
  5. Smart contracts can be deployed separately to blockchain

### 🔗 Wallet Connection & Navigation Fixes (October 13, 2025)
- **Fixed Coinbase/Wallet "Open in New Tab" Race Condition (PRODUCTION FIX v2)**:
  * Problem: localStorage flags were being cleared by origin tab before new tab could read them
  * Root cause: Both tabs run cleanup useEffect, creating a race condition
  * **Enhanced Solution with Timing Protection**:
    - Added timestamp tracking when flags are set (walletFlagsTimestamp)
    - 100ms delay before opening new tab to ensure localStorage persistence
    - Conditional cleanup: only tabs that USE the flags will clear them
    - 3-second cleanup delay to allow new tab to load and read flags
    - Comprehensive debug logging with flag age calculation
    - Added ?source=wallet_tab URL param for tracking in logs
  * Verification logging shows exact timing of flag set/read operations
  * Maintains backward compatibility with URL parameter approach
- **Navigation Bar Scrolling Fix (Latest)**:
  * Changed TabsList from `w-full max-w-7xl` to `inline-flex` for natural overflow
  * Parent container now uses `-mx-4 px-4` for edge-to-edge scrollable area
  * Moved overflow handling from TabsList to parent container
  * Users can now swipe/scroll through all navigation tabs on mobile and desktop
- **Production-Safe Navigation System**:
  * Added multi-layer fallback navigation with custom event system
  * Primary: onSwitchToTab callback, Fallback 1: Custom 'navigateToTab' event with listener in App.tsx
  * Fallback 2: DOM manipulation, Fallback 3: User-friendly error message
  * Ensures buttons (Visa Card, Arena, etc.) work in both preview and published environments
- **Referral Link Generation**: Uses dynamic request domain (req.protocol + req.get('host')) instead of hardcoded localhost
- **Improved Wallet Error Messages**: Clearer guidance for new users to install MetaMask or Coinbase Wallet

### 💳 Battle Pass Monetization System - Complete Implementation (October 12, 2025)
- **Battle Pass Recurring Revenue System LIVE** - Full Stripe integration with $29.99 premium tier ($50K-$200K/month target)
- **Critical Security Fixes Applied**:
  * Reward Claim Fraud Prevention - Added battle_pass_claims table for persistent tracking
  * XP Exploit Elimination - Removed user self-award endpoint, server-side only XP accrual
  * Role-Based Access Control - Replaced hardcoded admin ID with users.role field
- **Stripe Checkout Integration**:
  * POST /api/battle-pass/purchase/stripe-checkout endpoint (authenticated)
  * $29.99 price point, creates Stripe session with metadata tracking
  * Webhook automation activates premium status on payment success
- **BattlePassDashboard Frontend**:
  * Animated XP progress bar, two-column tier view (free/premium)
  * Reward claiming with confetti celebrations and toast notifications
  * Premium upsell with Stripe checkout redirect
  * Auto-refresh every 30 seconds, responsive mobile design
- **Revenue Model**: $29.99 premium tier per season, free tier drives conversion
- **Architect Approved**: Secure checkout flow, webhook reconciliation, proper UX with all user states handled

## System Architecture

### Frontend Architecture
The frontend is a React-based single-page application built with Vite, leveraging Radix UI for accessibility, Tailwind CSS for styling, and Framer Motion for animations. It follows a component-based design with state managed by Zustand stores for user authentication, contribution tracking, hero progression, and wallet connectivity. Immersive 3D elements are powered by React Three Fiber and Drei.

### Backend Architecture
The backend is a RESTful API developed with Express.js and TypeScript, featuring a clear separation of concerns between routes, business logic, and data access layers. Authentication uses JWT tokens. The storage layer employs a repository pattern for database abstraction, and error handling is centralized.

### Data Storage Solutions
PostgreSQL is the primary database, managed with Drizzle ORM for type-safe operations. The schema includes tables for users, contributions, NFT badges, mission progress, and token information, with proper foreign key relationships. Drizzle Kit manages database migrations.

### Authentication and Authorization
Authentication is JWT-based, with tokens in the Authorization header. Passwords are hashed with bcrypt. The system supports traditional username/password and Web3 wallet integration, with middleware securing routes and injecting user context. Role-Based Access Control (RBAC) is implemented using a 'role' field in the users table and JWT-signed payloads.

### UI/UX Decisions
The platform features an "Epic Post-Purchase NFT Minting Journey" with a multi-stage, gamified experience including animated progress bars, dramatic minting animations, achievement unlocks, confetti celebrations, and social sharing features. A "Demo Mode" allows users to preview this experience without purchase. A "Crypto Onboarding Hub" provides a central entry point for newcomers with an interactive MetaMask setup tutorial and educational content. Stripe payment integration allows for multiple payment options including credit/debit cards and crypto onramp. Dynamic content includes real-time team mission data, contribution-based leaderboards, and token economics displays. The platform also includes a Battle Pass system with free and premium tiers, dynamic NFT badge styling, and a viral referral system for user acquisition.

## External Dependencies
- **Web3 Integration**: ethers.js for blockchain interactions, MetaMask and other Web3 providers for wallet connectivity. Solidity for smart contracts (AirdropDistributor.sol, BattlePass.sol, CosmeticsNFT.sol with OpenZeppelin security features).
- **UI Frameworks**: Radix UI for components, Tailwind CSS for styling, Framer Motion for animations.
- **Build & Development Tools**: Vite, TypeScript.
- **3D Graphics**: React Three Fiber, Drei (part of the Three.js ecosystem).
- **Database Driver**: Neon serverless PostgreSQL driver.
- **Payment Processing**: Stripe for payment integration (Stripe Checkout, Stripe Crypto Onramp).
- **Security**: bcrypt for password hashing.
- **Email Services**: Microsoft Graph API for Outlook/Office 365 email integration.