# TrackFlow - Shipment Tracking Platform

TrackFlow is a real-time shipment tracking application built with React, Node.js, Express, and MongoDB.

## Prerequisites

Before running the application, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local or Atlas)
- [Redis](https://redis.io/) (Required for background workers)

## Getting Started

### 1. Environment Configuration

You must set up your environment variables for both the server and client.

#### Server
1. Navigate to the `server/` directory.
2. Copy `.env.example` to `.env`.
3. Fill in the required values:
   - `MONGODB_URI`: Your MongoDB connection string.
   - `REDIS_URL`: Your Redis connection string (e.g., `redis://localhost:6379`).
   - `JWT_SECRET`: A secret string for authentication.
   - `TWILIO_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE`: (Optional) For SMS notifications.
   - `SENDGRID_API_KEY`, `EMAIL_FROM`: (Optional) For Email notifications.
   - `FIREBASE_SERVICE_ACCOUNT`: (Optional) JSON string for push notifications.

#### Client
1. Navigate to the `client/` directory.
2. Copy `.env.example` to `.env`.
3. Fill in the required values:
   - `VITE_MAPTILER_KEY`: Your MapTiler access token.
   - `VITE_SOCKET_URL`: URL of the backend server (default: `http://localhost:5000`).

### 2. Installation

Install dependencies for both parts of the application:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Running the Application

To start the project in development mode:

#### Start the Server
```bash
cd server
npm run dev
```

#### Start the Client
```bash
cd client
npm run dev
```

The client will usually be available at `http://localhost:3000` (check your terminal output).

## Architecture

- **Backend**: Node.js/Express with Socket.io for real-time updates and Bull for background tasks.
- **Frontend**: React/Vite with TailwindCSS and MapTiler SDK for visualization.
- **Workers**: Separate workers for tracking updates and notifications (run within the main process in dev).
