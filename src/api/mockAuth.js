// Mock authentication system to replace Base44 SDK
class MockAuth {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
  }

  async me() {
    // Return a mock user if authenticated, otherwise throw error
    if (!this.isAuthenticated) {
      // Auto-authenticate for standalone mode
      this.currentUser = {
        id: 'mock-user-1',
        email: 'user@example.com',
        name: 'Demo User',
        onboarding_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.isAuthenticated = true;
    }
    
    return this.currentUser;
  }

  async login(email, password) {
    // Mock login - always succeeds in standalone mode
    this.currentUser = {
      id: 'mock-user-1',
      email: email || 'user@example.com',
      name: 'Demo User',
      onboarding_completed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.isAuthenticated = true;
    return this.currentUser;
  }

  async logout() {
    this.currentUser = null;
    this.isAuthenticated = false;
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
    
    return this.currentUser;
  }
}

export const User = new MockAuth();