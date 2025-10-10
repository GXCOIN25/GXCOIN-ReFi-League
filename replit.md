# GXCOIN Eco-Warrior Platform

## Overview
GXCOIN is an interactive, superhero-themed platform for regenerative finance (ReFi) that gamifies environmental impact. It allows users to create eco-warrior profiles, contribute to environmental causes, earn dynamic NFT badges, and track real impact metrics while progressing through ranks. The platform integrates Web3 wallet connectivity, token economics, and community features to foster engagement in environmental action with a business vision of leveraging gamification and Web3 to drive significant real-world environmental contributions and establish a leading platform in the ReFi space.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Updates

### Visa Black Card Tier Updates & NFT Production Mode Launch (October 10, 2025)
- **Black Card Tiers Completely Revised** - All 5 tiers updated with new names, pricing, and comprehensive benefits
- **New Tier Structure**:
  * Bronze Spark ($175/year) - 2% crypto back, blockchain benefits, eco-education
  * Silver Spark ($199/year) - 2% crypto back, gas/EV charging benefits, travel network, Green Energy Champion badge
  * Gold Spark ($295/year) - 3% crypto back, API integration, Carbon Offset Hero badge, travel insurance
  * Platinum Ambassador ($395/year) - 4% crypto back, unlimited gas benefits, privacy suite, VIP access
  * Diamond Elite BLACK CARD ($595/year) - 5% crypto back, ViaCarte fintech suite, executive access, metal card
- **Key Features by Tier**:
  * All tiers include progressive debit load values and credit limits (1:10 ratio)
  * Gas & EV charging cashback from 5% to 6% depending on tier
  * Exclusive badge recognition and achievement dashboards at higher tiers
  * Complete crypto-fiat ecosystem integration for Diamond Elite
- **NFT Minting Production Mode Launched** - Changed from "COMING SOON" to "NOW LIVE MAKE IT EPIC"
  * Updated badge styling to green with animate-pulse effect
  * Production Mode now shows as active for real blockchain NFT minting
- **Components Updated**:
  * BlackCardEnrollmentForm.tsx: Complete tier restructure with new pricing and benefits
  * LandingPage.tsx: NFT Minting Options badge updated to active status
- **Architect Approved**: All tier data structures verified, badge styling confirmed, HMR successful

### Domain Redirect Update: gxcoin.world → ai.gxcoin.world (October 9, 2025)
- **Updated Landing Page Domain References** - All gxcoin.world links now redirect to https://ai.gxcoin.world
- **Changes Applied**:
  * Official Website display text: "gxcoin.world" → "ai.gxcoin.world"
  * "Visit gxcoin.world" CTA button → "Visit ai.gxcoin.world"
  * Both CTAs now open https://ai.gxcoin.world in new tab with security attributes
- **Component Updated**: LandingPage.tsx (GXCOIN Launch Q3 2025 section)
- **Email Addresses Preserved**: davidvaz@gxcoin.world email addresses remain unchanged
- **Architect Approved**: All domain redirects verified, security attributes preserved (noopener,noreferrer)

### Black Card Pre-Enrollment Form with Tier Selection (October 9, 2025)
- **Created Epic Enrollment Form** - BlackCardEnrollmentForm component with comprehensive tier selection
- **5 Card Tiers Implemented**:
  * Bronze Recruit ($175+, $5K limit) - Patent licensing, eco-rewards, dashboard, staking
  * Silver Defender ($500+, $25K limit) - Bronze benefits + VIP concierge, self-custody
  * Gold Guardian ($1K+, $100K limit) - Silver benefits + Global events, Bitcoin cashback
  * Platinum Champion ($5K+, $500K limit) - Gold benefits + $500K spending, wealth management
  * Diamond Legend ($10K+, Unlimited) - Platinum benefits + Unlimited spending, dedicated concierge
- **Form Features**:
  * Visual tier selection cards with animations and hover effects
  * Form fields: Full Name, Email, Phone, Tier Selection, Environmental Contribution Level, Card Type (Debit/Credit), GXCOIN Anchor Ownership, Terms & Conditions
  * Real-time validation with error clearing
  * Confetti celebration animation on successful submission
  * Toast notifications with tier-specific messages
  * Responsive design with mobile optimization
- **Integration Points**:
  * BlackCard.tsx: "Apply for BLACK CARD" button opens enrollment form
  * LandingPage.tsx: "Apply for Your Card Today" button opens enrollment form
  * Both entry points correctly display selected tier in success messages
- **Technical Implementation**:
  * Radix UI Dialog wrapper for modal functionality
  * Framer Motion for epic entrance animations and tier card effects
  * Form state management with TypeScript validation
  * Confetti animation (500 pieces) on submission success
- **Email Notifications** (October 9, 2025):
  * Outlook/Office 365 integration via Microsoft Graph API
  * Automated email sent to davidvaz@gxcoin.world on each enrollment submission
  * Professional HTML email template with applicant details, tier selection, and timestamp
  * Backend endpoint: POST /api/black-card-enrollment
  * Real-time delivery with success/error handling
- **Architect Approved**: All integrations verified, toast handlers fixed, no security issues, consistent UX across entry points, email delivery tested and working

### CRITICAL FIX: Supreme Anchor Payment Link in Dynamic NFT Collection (October 9, 2025)
- **Bug Found**: When users clicked on "The Supreme Anchor" card in Dynamic NFT Collection, they were redirected to wrong payment link
- **Root Cause**: NFTPreview.tsx getValidTokenSymbol() function didn't include 'GXCOIN' in valid symbols array
  * Supreme Anchor has symbol='GXCOIN', but function fell back to 'GCCT'
  * This caused TokenBadge click handler to use CARBON/GRAPHENE payment link instead
- **Fix Applied**: Added 'GXCOIN' to valid symbols array in NFTPreview.tsx line 27
  * Changed from: `['WTR', 'HEMP', 'GPWR', 'BATT', 'GCCT']`
  * Changed to: `['WTR', 'HEMP', 'GPWR', 'BATT', 'GCCT', 'GXCOIN']`
- **Result**: Supreme Anchor card now correctly redirects to: https://buy.stripe.com/00w8wHfC2fO7g98dSc83C0y ✅
- **Architect Approved**: Logic verified correct, requires live UI testing

### Direct Stripe Payment Links & Pricing Display (October 9, 2025)
- **Updated All Purchase NFT Buttons** to redirect directly to Stripe checkout (bypassing modal)
- **Added Pricing Display**: All Purchase NFT buttons now show "from $175+" text
- **Flexible Hero ID Matching**: Implemented robust ID matching using includes() and toLowerCase()
  * Handles variations like 'aqua_wtr', 'aqua', 'AQUA', 'wtr' all correctly routing to AQUA payment link
  * Works for all heroes: AQUA, GXCOIN Anchor, GRAPHENE $BATT, CARBON $GCCT
- **Payment Links Configured**:
  * AQUA ($WTR): https://buy.stripe.com/00w14fblMdFZg98dSc83C0u
  * GXCOIN Anchor: https://buy.stripe.com/00w8wHfC2fO7g98dSc83C0y
  * GRAPHENE ($BATT): https://buy.stripe.com/dRm4grgG6fO78GG29u83C0x
  * CARBON ($GCCT): https://buy.stripe.com/dRm4grgG6fO78GG29u83C0x (same as GRAPHENE)
- **Components Updated**:
  * App.tsx: Hero cards "Purchase NFT" buttons with pricing
  * HeroShowcase.tsx: "Join Mission" buttons
  * StripeNFTPurchase.tsx: Card payment handler
  * TokenBadge.tsx: Token purchase CTAs
  * GameArena.tsx: Purchase dNFT buttons
  * NFTPreview.tsx: Purchase dNFT button now redirects based on selected NFT card (fixes GXCOIN Anchor routing)
- **Architect Approved**: All payment routing verified, pricing displays correctly, no security issues

### Epic Demo Button in Crypto Onboarding Hub (October 8, 2025)
- Added prominent "Take the Epic Tour" demo button in Crypto Onboarding Hub's "Buy Your First NFT" tab
- **Visual Design**:
  * Yellow/orange/red gradient card with animated background pulse
  * Rocket icon with rotation and scale animation
  * Pulsing Sparkles icon for attention
  * Shadow effects and hover/tap animations
- **Features Highlighted**:
  * Epic Animations
  * Achievement Unlocks
  * Confetti Celebration
  * Social Sharing
- **Functionality**:
  * Opens `/success?demo=true` in new tab (SSR-safe anchor element)
  * No wallet or payment required
  * Positioned prominently before payment options
  * Separated by divider with "Or choose a payment method" text
- **User Benefits**:
  * Allows prospective buyers to preview celebration journey before purchase
  * Reduces purchase friction by showing exact post-purchase experience
  * Builds excitement and confidence in NFT minting journey
- **Technical Implementation**:
  * Uses Button asChild prop with anchor element for SSR compatibility
  * Framer Motion animations for visual impact
  * Maintains all accessibility features (rel="noopener noreferrer")
- **Architect Approved**: SSR-safe implementation, no security issues, maintains all animations and styling

## System Architecture

### Frontend Architecture
The frontend is a React-based single-page application built with Vite, leveraging Radix UI for accessibility, Tailwind CSS for styling, and Framer Motion for animations. It follows a component-based design with state managed by Zustand stores for user authentication, contribution tracking, hero progression, and wallet connectivity. Immersive 3D elements are powered by React Three Fiber and Drei.

### Backend Architecture
The backend is a RESTful API developed with Express.js and TypeScript, featuring a clear separation of concerns between routes, business logic, and data access layers. Authentication uses JWT tokens. The storage layer employs a repository pattern for database abstraction, and error handling is centralized.

### Data Storage Solutions
PostgreSQL is the primary database, managed with Drizzle ORM for type-safe operations. The schema includes tables for users, contributions, NFT badges, mission progress, and token information, with proper foreign key relationships. Drizzle Kit manages database migrations.

### Authentication and Authorization
Authentication is JWT-based, with tokens in the Authorization header. Passwords are hashed with bcrypt. The system supports traditional username/password and Web3 wallet integration, with middleware securing routes and injecting user context.

### UI/UX Decisions
The platform features an "Epic Post-Purchase NFT Minting Journey" with a multi-stage, gamified experience including animated progress bars, dramatic minting animations, achievement unlocks, confetti celebrations, and social sharing features. A "Demo Mode" allows users to preview this experience without purchase. A "Crypto Onboarding Hub" provides a central entry point for newcomers with an interactive MetaMask setup tutorial and educational content. Stripe payment integration allows for multiple payment options including credit/debit cards and crypto onramp. Dynamic content includes real-time team mission data, contribution-based leaderboards, and token economics displays.

## External Dependencies
- **Web3 Integration**: ethers.js for blockchain interactions, MetaMask and other Web3 providers for wallet connectivity.
- **UI Frameworks**: Radix UI for components, Tailwind CSS for styling, Framer Motion for animations.
- **Build & Development Tools**: Vite, TypeScript.
- **3D Graphics**: React Three Fiber, Drei (part of the Three.js ecosystem).
- **Database Driver**: Neon serverless PostgreSQL driver.
- **Payment Processing**: Stripe for payment integration (Stripe Checkout, Stripe Crypto Onramp).
- **Security**: bcrypt for password hashing.