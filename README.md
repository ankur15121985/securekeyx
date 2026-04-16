# Chakravyuh Tactical Encryption Node - Deployment Guide

This application is a full-stack React + Express application designed for sovereign cryptographic asset protection. It can be deployed to any server supporting Node.js and MySQL.

## Prerequisites
- Node.js (v18+)
- MySQL Database
- NPM or Yarn

## Local Setup & Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` with your MySQL credentials.
3. Initialize Database:
   - Run the SQL commands in `schema.sql` on your MySQL server.
4. Start development server:
   ```bash
   npm run dev
   ```

## Production Deployment
1. Build the frontend:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm run start
   ```
   The server will serve the static files from the `dist` directory and handle API requests.

## Database Schema
The database schema is provided in `schema.sql`. It includes tables for:
- `users`: Authentication and roles.
- `crypto_keys`: Secure storage for encrypted keys and metadata.

## Exporting as ZIP
To download this project as a ZIP file:
1. Open the **Settings** menu in the AI Studio Build interface.
2. Select **Export to ZIP**.
3. This will package the entire source code, including the MySQL integration and deployment scripts.

## Vercel Deployment (Optional)
The project includes a `vercel.json` for easy deployment to Vercel. Ensure you configure the Environment Variables in the Vercel Dashboard.
