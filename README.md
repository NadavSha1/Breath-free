# BreatheFree - Quit Smoking App

A standalone React application to help you quit smoking and track your progress.

## Features

- Track smoking entries and cravings
- Monitor your progress with detailed statistics
- Get motivational support during cravings
- Achievement system to celebrate milestones
- Completely offline - data stored locally

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) with your browser to see the result.

## Building for Production

```bash
npm run build
```

This will create a `dist` folder with the production build that can be served by any static file server.

## Serving the Production Build

After building, you can serve the production build using:

```bash
npm install express  # Only needed once
npm run serve
```

This will start a server at [http://localhost:3000](http://localhost:3000).

## Data Storage

This application stores all data locally in your browser's localStorage. Your data is:
- Completely private (never sent to any server)
- Persistent across browser sessions
- Only accessible from the same browser/device

## Features Overview

- **Smoking Tracking**: Log cigarettes with timestamps and optional notes
- **Craving Management**: Track cravings and get motivational support
- **Statistics**: View detailed progress charts and statistics
- **Achievements**: Unlock milestones as you progress
- **Offline Support**: Works completely offline after initial load