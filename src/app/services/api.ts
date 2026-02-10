// API Service for connecting to Go backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export interface GmailConnectRequest {
  email: string;
  redirectUri: string;
}

export interface GmailConnectResponse {
  authUrl: string;
  state: string;
}

export interface GmailCallbackRequest {
  code: string;
  state: string;
}

export interface GmailCallbackResponse {
  success: boolean;
  email: string;
  subscriptionsFound: number;
}

export interface GoogleAuthRequest {
  credential: string;
}

export interface GoogleAuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    picture: string;
  };
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Google Sign-In (for Login page)
  async googleSignIn(credential: string): Promise<GoogleAuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credential }),
    });

    if (!response.ok) {
      throw new Error('Failed to authenticate with Google');
    }

    return response.json();
  }

  // Gmail OAuth - Step 1: Get authorization URL
  async initiateGmailConnection(email: string): Promise<GmailConnectResponse> {
    const redirectUri = `${window.location.origin}/gmail-callback`;
    
    const response = await fetch(`${this.baseUrl}/gmail/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify({ 
        email,
        redirectUri 
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to initiate Gmail connection');
    }

    return response.json();
  }

  // Gmail OAuth - Step 2: Exchange code for token
  async completeGmailConnection(code: string, state: string): Promise<GmailCallbackResponse> {
    const response = await fetch(`${this.baseUrl}/gmail/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify({ code, state }),
    });

    if (!response.ok) {
      throw new Error('Failed to complete Gmail connection');
    }

    return response.json();
  }

  // Get subscriptions from backend
  async getSubscriptions() {
    const response = await fetch(`${this.baseUrl}/subscriptions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subscriptions');
    }

    return response.json();
  }

  // Trigger Gmail scan
  async scanGmail() {
    const response = await fetch(`${this.baseUrl}/gmail/scan`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to scan Gmail');
    }

    return response.json();
  }

  // Helper to get auth token from localStorage
  private getAuthToken(): string {
    return localStorage.getItem('authToken') || '';
  }

  // Helper to set auth token
  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  // Helper to clear auth token
  clearAuthToken(): void {
    localStorage.removeItem('authToken');
  }
}

export const apiService = new ApiService();
