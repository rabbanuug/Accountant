# Docklands Accountants - Project Context

## Overview
Docklands Accountants is a comprehensive system designed to facilitate communication and document management between an accounting firm and its clients. It consists of two main components:
1. **Web Dashboard (Laravel + Inertia + React)**: Used primarily by the accountant (admin) to manage multiple clients, and can also be used by clients.
2. **Mobile App (React Native + Expo)**: Used primarily by clients for easy access to their accounting data, document uploads, and direct communication with their accountant.

## Architecture & Tech Stack

### Backend (API & Web App)
- **Framework**: Laravel 11 (PHP 8.2)
- **Frontend integration**: Inertia.js with React 18, TypeScript, and TailwindCSS
- **Database**: PostgreSQL (migrated from SQLite)
- **Authentication**: Laravel Sanctum (for mobile API) and Fortify (for web)
- **Environment**: Dockerized (PHP-FPM + Nginx/Caddy + PostgreSQL)
- **Storage**: Local filesystem (`storage/app/public` symlinked to `public/storage`)

### Mobile App
- **Framework**: React Native with Expo (SDK 52)
- **Routing**: Expo Router (file-based routing)
- **Styling**: React Native StyleSheet + Expo Linear Gradient
- **State Management**: React Hooks + Expo SecureStore for local persistence
- **Networking**: Axios instance configured with base URL (e.g., `https://dockland.proconsulting.ai/api`) and Bearer token injection.
- **Build System**: EAS (Expo Application Services) - currently building AABs for Android.

## Core Features & Modules

### 1. User Management & Authentication
- **Roles**: `accountant` (admin) and `client`.
- **Registration**: Self-registration is disabled. New client accounts must be created by the accountant/admin backend.
- **Login**: Email/password authentication. Mobile app uses Sanctum tokens.

### 2. Real-time Messaging
- Secure, direct messaging between the accountant and their clients.
- Status indicators (read receipts, typing indicators, online status).
- Endpoints allow marking messages as read or starred.

### 3. Document Management
- Core feature for clients to upload receipts, bills, and tax documents.
- Accountants can review, approve, or request resubmission of documents.
- Includes document status tracking (Pending, Approved, Needs Attention).

### 4. Accounting Services Library
A modular suite of accounting services that can be enabled/disabled per client:
- **Company Info**: Essential business details (registration number, address).
- **Payroll**: Submission of employee hours, payslips generation, liability tracking, P60/P45 distribution, and starter forms.
- **Accounts**: Yearly financial accounts management.
- **Corporation Tax**: CT600 forms and tax liability tracking.
- **VAT**: Quarterly VAT return submissions.
- **Self Assessment**: Personal tax return document management.

*(Note: In the mobile app, the year/month selectors for these services default to the current year/date).*

### 5. Meetings
- Scheduling and tracking meetings between the accountant and the client.

### 6. Account Management (Compliance)
- **In-App Deletion**: Authenticated account deletion from within the mobile app settings.
- **Public Deletion Request**: An unauthenticated web route (`/account-deletion`) to satisfy Google Play Store data deletion policy requirements.

## Deployment Context
- The web application is configured to run behind a reverse proxy (Caddy/Traefik) with a custom domain (e.g., `dockland.proconsulting.ai`).
- HTTPS/SSL is terminated at the proxy level; Laravel is configured to trust proxies (resolving previous redirect/419 Page Expired errors).
- Docker composition includes `accountant-web-app`, `accountant-db`, and `accountant-web-caddy`.

## Local Development Tips
- **Web**: Run `docker compose up -d --build` in the `web/` directory. (Ensure storage link exists: `php artisan storage:link`).
- **Mobile**: Run `npx expo start --tunnel --port 8082` in the `mobile/` directory (Expo Go is used for local testing).

## Recent Major Updates
- **Database Migration**: Successfully migrated from SQLite to PostgreSQL.
- **UI Overhaul**: Updated the web login and mobile app to feature a consistent, premium dark theme with vibrant blue/teal gradients, glassmorphism, and modern typography.
- **Registration Disabled**: The public `/register` route was removed, as account creation is handled internally by the firm.
- **Play Store Readiness**: Addressed Google Play Store requirements by implementing an in-app "Delete Account" button and a public account deletion request page. Created privacy policy and feature graphics. Built the production `.aab` file (version code 3) using EAS.
