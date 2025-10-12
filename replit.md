# GXCOIN Eco-Warrior Platform

## Overview
GXCOIN is an interactive, superhero-themed platform for regenerative finance (ReFi) that gamifies environmental impact. It allows users to create eco-warrior profiles, contribute to environmental causes, earn dynamic NFT badges, and track real impact metrics while progressing through ranks. The platform integrates Web3 wallet connectivity, token economics, and community features to foster engagement in environmental action. The business vision is to leverage gamification and Web3 to drive significant real-world environmental contributions and establish a leading platform in the ReFi space.

## User Preferences
Preferred communication style: Simple, everyday language.

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