# GXCOIN Eco-Warrior Platform

## Overview
GXCOIN is an interactive, superhero-themed platform for regenerative finance (ReFi) that gamifies environmental impact. It allows users to create eco-warrior profiles, contribute to environmental causes, earn dynamic NFT badges, and track real impact metrics while progressing through ranks. The platform integrates Web3 wallet connectivity, token economics, and community features to foster engagement in environmental action. The business vision is to leverage gamification and Web3 to drive significant real-world environmental contributions and establish a leading platform in the ReFi space.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Updates

### 🔗 Wallet Connection & Navigation Fixes (October 13, 2025)
- **Fixed Coinbase/Wallet "Redirect to Login" Issue**:
  * Problem: "Open in New Tab" button for wallet extensions redirected users to welcome screen instead of wallet page
  * Solution: Added URL parameters (skipWelcome=true, tab=wallet) to preserve navigation context when opening in new browser tab
  * App.tsx now reads URL parameters to skip welcome screen and open directly to requested tab
  * URL cleanup after initialization for clean browser history
- **Navigation Bar Scrolling Fix**:
  * Removed `justify-center` constraint that prevented horizontal scrolling on mobile
  * Added `!justify-start` override to TabsList for proper scroll behavior
  * Mobile users can now swipe left/right to access all navigation tabs
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