# GXCOIN Eco-Warrior Platform

## Overview

GXCOIN is an interactive superhero-themed platform for regenerative finance (ReFi) that gamifies environmental impact through NFT badges, rank progression, and real-world contributions. Users create eco-warrior profiles, contribute to environmental causes, earn dynamic NFT badges, and progress through ranks while tracking real impact metrics like carbon offset and plastic removal. The platform integrates Web3 wallet connectivity, token economics, and community features to create an engaging experience around environmental action.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Updates (October 6, 2025)

### Stripe Integration & Crypto Onboarding System (Latest)
Complete payment integration and beginner-friendly crypto education system for first-time users:

1. **Stripe Payment Integration**
   - Added Stripe backend with checkout and webhook endpoints
   - Created `purchaseHistory` table to track all NFT purchases
   - Public endpoint `/api/public/stripe/create-checkout-session` for unauthenticated users
   - Authenticated endpoint `/api/stripe/create-checkout-session` for logged-in users
   - Webhook handler `/api/stripe/webhook` processes successful payments and auto-mints NFTs
   - Secure payment verification through Stripe's webhook system
   - Added `stripeCustomerId` to users table for customer tracking

2. **NFT Purchase Flow Component**
   - Built `StripeNFTPurchase.tsx` with multiple payment options:
     * Credit/Debit Card payment (Stripe Checkout - fully functional)
     * Buy Crypto First (Stripe Crypto Onramp integration - functional)
     * Direct Crypto Payment (disabled - coming soon, awaits blockchain verification)
   - Pricing tiers by rarity: Common $9.99, Rare $24.99, Epic $49.99, Legendary $99.99, Mythic $199.99
   - Beginner-friendly tooltips explaining NFTs, gas fees, and payment security
   - Success animations with confetti celebration
   - Comprehensive error handling for payment failures

3. **Interactive MetaMask Setup Tutorial**
   - Created `MetaMaskOnboarding.tsx` with 5-step wizard:
     * Step 1: Welcome & Education (What is MetaMask, why you need a wallet)
     * Step 2: Installation Guide (browser extension & mobile app downloads, auto-detection)
     * Step 3: Account Setup & Security (seed phrase education, backup instructions, critical warnings)
     * Step 4: Connect Wallet (permission explanations, success animation)
     * Step 5: Get Started (congratulations, next steps, quick tips)
   - Progress indicator showing completion percentage
   - Back/Next navigation with skip option for experienced users
   - Tooltips on all technical terms
   - Mobile responsive with dark theme

4. **Crypto Onboarding Hub**
   - Built `CryptoOnboardingHub.tsx` as central entry point for newcomers:
     * Tab 1: "Getting Started" - Web3 introduction and value proposition
     * Tab 2: "Setup MetaMask" - Embedded wallet setup wizard with progress tracking
     * Tab 3: "Buy Your First NFT" - Three payment pathways clearly explained with quiz
     * Tab 4: "Learn & FAQ" - 13 comprehensive FAQs, glossary of 18 crypto terms, video tutorial
     * Tab 5: "Security Tips" - Best practices, do's/don'ts, scam reporting
   - Progress tracking with localStorage persistence
   - Celebration animation on completion
   - Integration with useUser store for completion status

5. **App Integration & User Flow**
   - Auto-detect first-time users (shows onboarding after 2-second delay)
   - "Crypto Guide" navigation tab accessible from anywhere
   - Enhanced WalletConnect with "New to crypto?" onboarding link
   - "Purchase NFT" buttons added to all hero cards in Heroes tab
   - Landing page buttons trigger appropriate flows based on user state
   - Environment variables for Stripe keys documented in .env.example

6. **Security & Production Readiness**
   - Direct crypto payments disabled until blockchain verification implemented
   - All payments verified through Stripe webhooks before NFT minting
   - Unauthenticated users can purchase via Stripe card payment
   - Authenticated users have full payment options (card only for now)
   - Clear TODO documentation for future crypto payment verification
   - No security vulnerabilities - architect-reviewed and approved

7. **Stripe Payment Link Integration (October 7, 2025)**
   - AQUA ($WTR) hero uses direct Stripe payment link: https://buy.stripe.com/00w14fblMdFZg98dSc83C0u
   - 200 units available as Limited Edition NFT Series
   - **"Purchase dNFT" button** added to all hero cards in Heroes tab (renamed from "Purchase NFT")
   - **All AQUA ($WTR) images are clickable** and redirect to Stripe checkout:
     * Token badges on Landing Page (agua-wtr-correct.jpg)
     * AQUA Water Spotlight image (aqua-water-spotlight.jpg)
     * Hero selector circular images in background
     * Hero card images in Heroes selection
   - Other heroes show "Payment link coming soon" message until payment links are configured
   - Button uses gradient blue-to-purple styling for visibility

**Technical Stack Added:**
- `stripe` and `@stripe/stripe-js` packages
- `react-confetti` for success animations
- Additional Radix UI components (Dialog, Tooltip, Accordion, Checkbox)
- Database schema updates via Drizzle migrations

All integrations follow security best practices with proper error handling, loading states, and user feedback.

### Landing Page Button Functionality (October 4, 2025)
All landing page buttons now have proper functionality and security:

1. **"Visit gxcoin.world" Button**
   - Opens https://gxcoin.world in new tab
   - Includes security parameters (noopener, noreferrer) to prevent reverse tabnabbing

2. **"Activate AQUA dNFT" Button**
   - Smart conditional logic: navigates to Heroes tab if user is logged in
   - Opens login modal if user is not logged in
   - Provides smooth onboarding flow

3. **"Assemble Your Heroes" Button**
   - Navigates to Heroes tab when clicked
   - Allows users to view and select eco-warrior heroes

4. **Additional Buttons**
   - "Subscribe Updates" - Opens gxcoin.world in new tab with security parameters
   - "Learn More" - Navigates to Heroes tab for more information

All button handlers follow security best practices with noopener/noreferrer parameters on external links.

### Frontend-Backend Integration Completed
Successfully integrated all landing page features with backend APIs:

1. **Team Missions Integration**
   - Created `/api/missions/team` endpoint with real-time participant aggregation
   - Frontend now displays live mission data instead of mock data
   - Shows dynamic participant counts and collective progress

2. **Leaderboard System**  
   - Implemented `/api/leaderboard` endpoint with contribution-based ranking
   - Aggregates user contributions from database
   - Auto-assigns rank titles (Diamond Legend, Platinum Hero, Gold Guardian, etc.)
   - Frontend displays real top contributors with live rankings

3. **Token Economics Integration**
   - Added `tokens` table to database (AQUA, HEMP, VOLTRA, GRAPHENE, TRADER)
   - Created `/api/tokens/prices` endpoint for market data
   - Created `/api/tokens/balances` endpoint for user holdings
   - Token balances calculated from user's economic rewards
   - Frontend displays real token prices instead of simulated data

All integrations follow existing architecture patterns with proper JWT authentication, error handling, and loading states.

## System Architecture

### Frontend Architecture
The client uses a React-based single-page application built with Vite for fast development and optimized production builds. The UI leverages Radix UI components for accessibility and Tailwind CSS for styling, with Framer Motion providing smooth animations. The architecture follows a component-based design with reusable UI elements and clear separation of concerns between presentation and business logic.

State management is handled through Zustand stores, providing a lightweight alternative to Redux. Key stores manage user authentication, contribution tracking, hero progression, wallet connectivity, and audio preferences. This approach keeps state management simple while maintaining good performance and developer experience.

The 3D elements are powered by React Three Fiber and Drei, enabling immersive visual experiences for the superhero theme. The build system supports GLSL shaders and various media formats for rich interactive content.

### Backend Architecture
The server implements a RESTful API using Express.js with TypeScript for type safety. The architecture follows clean separation between routes, business logic, and data access layers. Authentication is handled through JWT tokens stored in headers for security, with middleware protecting authenticated endpoints.

The storage layer uses a repository pattern with an interface-based design, making it easy to swap database implementations. Error handling is centralized through Express middleware, providing consistent error responses across the API.

Development and production environments are handled differently - Vite dev server is integrated in development for hot module replacement, while production serves static assets from the built client.

### Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The schema includes tables for users, contributions, NFT badges, and mission progress with proper foreign key relationships.

Database configuration supports connection pooling and SSL for production deployments. Migrations are managed through Drizzle Kit, ensuring consistent schema evolution across environments.

The data model supports user profiles with optional wallet addresses, contribution tracking with impact metrics stored as JSON, and NFT badge progression with dynamic attributes. Mission progress is tracked per user with completion states.

### Authentication and Authorization
Authentication uses a JWT-based system with tokens stored in the Authorization header. Passwords are hashed using bcrypt for security. The system supports both traditional username/password authentication and integration with Web3 wallets.

The authentication middleware validates tokens on protected routes and injects user context into requests. Registration allows optional wallet addresses to support both Web2 and Web3 users.

User sessions are maintained client-side with secure token storage, and the frontend automatically includes auth headers in API requests.

### External Dependencies
The platform integrates Web3 functionality through ethers.js for blockchain interactions, specifically targeting Ethereum-compatible networks. Wallet connectivity supports MetaMask and other Web3 providers through the standard ethereum object.

The UI framework relies heavily on Radix UI primitives for accessible components, while Tailwind CSS provides utility-first styling. Framer Motion handles complex animations and transitions throughout the interface.

Development tools include Vite for build tooling, TypeScript for type safety, and various linting/formatting tools. The Three.js ecosystem (React Three Fiber, Drei) powers 3D graphics capabilities.

Database connectivity uses the Neon serverless PostgreSQL driver for scalable cloud deployments, with Drizzle ORM providing the data access layer and migration management.

Audio features are built into the client-side stores, allowing for ambient sounds and feedback without external service dependencies. The platform is designed to work primarily as a client-server application with optional blockchain integration for advanced features.