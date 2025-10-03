# GXCOIN Eco-Warrior Platform

## Overview

GXCOIN is an interactive superhero-themed platform for regenerative finance (ReFi) that gamifies environmental impact through NFT badges, rank progression, and real-world contributions. Users create eco-warrior profiles, contribute to environmental causes, earn dynamic NFT badges, and progress through ranks while tracking real impact metrics like carbon offset and plastic removal. The platform integrates Web3 wallet connectivity, token economics, and community features to create an engaging experience around environmental action.

## User Preferences

Preferred communication style: Simple, everyday language.

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