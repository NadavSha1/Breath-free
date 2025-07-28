import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Clear any old base44 authentication data on app startup
function clearOldAuthData() {
  try {
    // Clear localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('base44') || key.includes('auth_token') || key.includes('callback'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => {
      console.log('Clearing old auth data:', key);
      localStorage.removeItem(key);
    });
    
    // Clear sessionStorage
    const sessionKeysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.includes('base44') || key.includes('auth_token') || key.includes('callback'))) {
        sessionKeysToRemove.push(key);
      }
    }
    sessionKeysToRemove.forEach(key => {
      console.log('Clearing old session auth data:', key);
      sessionStorage.removeItem(key);
    });
    
    // Clear any cookies that might contain base44 data
    document.cookie.split(";").forEach(function(c) { 
      const cookie = c.trim();
      if (cookie.includes('base44') || cookie.includes('auth')) {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        console.log('Clearing old auth cookie:', name);
      }
    });
  } catch (error) {
    console.warn('Error clearing old auth data:', error);
  }
}

// Run cleanup before rendering the app
clearOldAuthData();

ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
) 