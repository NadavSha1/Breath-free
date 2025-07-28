// Mock authentication system to replace Base44 SDK
class MockAuth {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    // Clear any old base44 authentication data
    this.clearOldAuthData();
  }

  clearOldAuthData() {
    // Clear any potential base44 or old authentication data
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('base44') || key.includes('auth_token') || key.includes('callback'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear session storage as well
    const sessionKeysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.includes('base44') || key.includes('auth_token') || key.includes('callback'))) {
        sessionKeysToRemove.push(key);
      }
    }
    sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
  }

  async me() {
    // Always clear old data first
    this.clearOldAuthData();
    
    // Return a mock user if authenticated, otherwise auto-authenticate
    if (!this.isAuthenticated) {
      // Auto-authenticate for standalone mode
      this.currentUser = {
        id: 'mock-user-1',
        email: 'user@example.com',
        name: 'Demo User',
        onboarding_completed: localStorage.getItem('onboarding_completed') === 'true',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.isAuthenticated = true;
      
      // Store authentication state
      localStorage.setItem('mock_auth_user', JSON.stringify(this.currentUser));
    }
    
    return this.currentUser;
  }

  async login(email, password) {
    // Clear old data first
    this.clearOldAuthData();
    
    // Mock login - always succeeds in standalone mode
    this.currentUser = {
      id: 'mock-user-1',
      email: email || 'user@example.com',
      name: 'Demo User',
      onboarding_completed: localStorage.getItem('onboarding_completed') === 'true',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.isAuthenticated = true;
    
    // Store authentication state
    localStorage.setItem('mock_auth_user', JSON.stringify(this.currentUser));
    
    return this.currentUser;
  }

  async logout() {
    this.currentUser = null;
    this.isAuthenticated = false;
    localStorage.removeItem('mock_auth_user');
    this.clearOldAuthData();
  }

  async updateProfile(data) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }
    
    this.currentUser = {
      ...this.currentUser,
      ...data,
      updated_at: new Date().toISOString()
    };
    
    // Update stored user data
    localStorage.setItem('mock_auth_user', JSON.stringify(this.currentUser));
    
    // Store onboarding completion status
    if (data.onboarding_completed !== undefined) {
      localStorage.setItem('onboarding_completed', data.onboarding_completed.toString());
    }
    
    return this.currentUser;
  }
}

export const User = new MockAuth();