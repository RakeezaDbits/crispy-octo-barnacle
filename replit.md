# SecureHome Audit Application

## Overview

SecureHome Audit is a full-stack web application for booking and managing professional home security audits and title protection services. The platform allows homeowners to schedule appointments, process payments, and receive comprehensive asset documentation services. Built with React, Express, and PostgreSQL, it features an integrated booking system with Square payment processing and email notifications.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful endpoints with JSON responses
- **File Structure**: Modular architecture with separate concerns for routes, storage, and services
- **Error Handling**: Centralized error middleware with proper HTTP status codes

### Database Design
- **Database**: PostgreSQL with Neon serverless hosting
- **Schema Management**: Drizzle Kit for migrations and schema updates
- **Tables**: 
  - `users` - Authentication and user management
  - `appointments` - Booking records with payment and status tracking
- **Connection**: Connection pooling with @neondatabase/serverless
- **Validation**: Drizzle-zod integration for runtime schema validation

### Authentication & Security
- **Session Management**: Express sessions with PostgreSQL storage (connect-pg-simple)
- **Data Validation**: Zod schemas for input validation and type safety
- **Environment Variables**: Secure configuration for database URLs and API keys
- **CORS**: Configured for cross-origin requests in development

### Payment Processing
- **Provider**: Square Payment API integration
- **Environment**: Configurable sandbox/production environments
- **Features**: Credit card processing with tokenization
- **Security**: PCI-compliant payment handling through Square's hosted fields

### Email System
- **Service**: Nodemailer for transactional emails
- **Templates**: HTML email templates for appointment confirmations
- **Configuration**: SMTP configuration with environment variables
- **Error Handling**: Graceful degradation when email service unavailable

### Development Workflow
- **Hot Reload**: Vite HMR for instant development feedback
- **Type Checking**: TypeScript strict mode across frontend and backend
- **Path Aliases**: Configured aliases for clean imports (@/, @shared/)
- **Build Process**: Separate client and server build pipelines
- **Database Management**: Drizzle commands for schema synchronization

## External Dependencies

### Core Technologies
- **React Ecosystem**: React 18, React DOM, React Hook Form
- **Backend Framework**: Express.js with TypeScript support
- **Database**: PostgreSQL via Neon serverless with Drizzle ORM
- **Build Tools**: Vite, esbuild for production builds

### UI and Styling
- **Component Library**: Radix UI primitives for accessible components
- **Design System**: shadcn/ui component collection
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer
- **Icons**: Lucide React icon library
- **Fonts**: Google Fonts (Inter, DM Sans, Architects Daughter, Fira Code, Geist Mono)

### State Management and Data Fetching
- **Server State**: TanStack React Query for caching and synchronization
- **Form Management**: React Hook Form with Hookform Resolvers
- **Validation**: Zod for schema validation and type inference

### Payment Integration
- **Square API**: Square JavaScript SDK for payment processing
- **Payment UI**: Square's hosted payment fields for secure card input

### Email Services
- **Email Provider**: Nodemailer for SMTP email delivery
- **Template Engine**: Custom HTML email templates

### Development and Deployment
- **Runtime Environment**: Node.js with ES modules
- **Package Manager**: npm with package-lock.json
- **Environment**: Replit-optimized with development banners and error overlays
- **Database Hosting**: Neon PostgreSQL serverless platform

### Utility Libraries
- **Date Handling**: date-fns for date manipulation
- **Styling Utilities**: clsx and class-variance-authority for conditional styles
- **Command Menu**: cmdk for search interfaces
- **Unique IDs**: nanoid for generating unique identifiers