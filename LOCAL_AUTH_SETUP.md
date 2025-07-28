# BreatheFree Local Authentication Setup

This document explains how the BreatheFree app now works with a completely local authentication system, eliminating any dependencies on Base44 or external authentication services.

## Overview

The app has been converted to use a **mock authentication system** that:
- ✅ Works completely offline
- ✅ Stores all data locally in your browser
- ✅ No external API calls or dependencies
- ✅ No callback domain errors
- ✅ Complete privacy - your data never leaves your device

## How to Use

### 1. Start the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### 2. Login Process

When you first visit the app, you'll see the **Login page** with two options:

#### Option A: Manual Login
- Enter any email and password
- The system will accept any credentials (it's a mock system)
- You'll be logged in and redirected to onboarding

#### Option B: Demo Login
- Click "Try Demo Version" 
- Automatically logs you in with demo credentials
- Perfect for testing the app

### 3. Data Storage

All your data is stored locally using:
- **localStorage** for user settings and preferences
- **sessionStorage** for temporary data
- No external databases or servers

### 4. Features Available

✅ **Full App Functionality**
- Complete onboarding process
- Smoking tracking and statistics
- Craving management with AI-like responses
- Achievement system
- Goal setting and progress tracking
- Account management

✅ **Privacy & Security**
- All data stays on your device
- No network requests to external services
- No tracking or analytics
- No data collection

## Technical Details

### Authentication Flow

1. **App Startup**: Clears any old Base44 authentication data
2. **Login Page**: Accepts any credentials via mock authentication
3. **Session Management**: Uses localStorage to maintain login state
4. **Logout**: Clears all authentication data and redirects to login

### Mock Services

The app includes mock implementations for:

- **Authentication** (`src/api/mockAuth.js`)
- **Entity Management** (`src/api/mockEntities.js`) 
- **Integrations** (`src/api/mockIntegrations.js`)

### Storage Cleanup

The app automatically clears any old Base44 data on startup, including:
- localStorage keys containing 'base44', 'auth_token', or 'callback'
- sessionStorage with similar patterns
- Authentication-related cookies

## Troubleshooting

### "Callback domain is not valid" Error

If you still see this error:

1. **Clear Browser Data**: 
   - Open Developer Tools (F12)
   - Go to Application/Storage tab
   - Clear all localStorage and sessionStorage
   - Clear cookies for the domain

2. **Hard Refresh**: 
   - Press `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
   - This forces a complete page reload

3. **Incognito/Private Mode**:
   - Try opening the app in an incognito/private browser window
   - This ensures no cached data interferes

### App Not Loading

1. **Check Console**: Open Developer Tools and check for JavaScript errors
2. **Restart Dev Server**: Stop (`Ctrl+C`) and restart (`npm run dev`)
3. **Clear Node Modules**: Delete `node_modules` and run `npm install` again

### Data Not Persisting

The app uses localStorage, so data will persist between sessions but:
- Clearing browser data will delete all app data
- Incognito mode data is cleared when closing the window
- Different browsers have separate data stores

## Production Deployment

For production deployment:

```bash
# Build the app
npm run build

# Serve the built files
npm run serve
```

The built app can be served from any static file server (Apache, Nginx, etc.) with no additional configuration needed.

## Development Notes

### Adding New Features

When adding new features:
- Use the mock authentication system in `src/api/mockAuth.js`
- Store data in localStorage via the entity management system
- No need to configure external APIs or authentication providers

### Testing

The mock system makes testing easy:
- No need to set up authentication servers
- Predictable responses from mock services
- Easy to test different user states

## Migration from Base44

This app was previously using Base44 authentication. The migration included:

1. ✅ Removed `@base44/sdk` dependency
2. ✅ Created mock authentication system
3. ✅ Updated all API calls to use mock services
4. ✅ Added automatic cleanup of old Base44 data
5. ✅ Created new login flow with local authentication

## Support

If you encounter any issues:

1. Check this documentation first
2. Clear browser data and try again
3. Check the browser console for error messages
4. Try in incognito mode to rule out cached data issues

The app is designed to work completely offline and locally, so most issues are related to cached data from previous versions.