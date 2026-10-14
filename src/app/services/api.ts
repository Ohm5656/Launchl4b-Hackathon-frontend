// API Service for connecting to backend (FastAPI bridge for now)
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/* =======================
   Types (ตรงกับ JSON จาก AI)
======================= */
export interface Subscription {
  service_name: string;
  category?: string;
  subscribed_date?: string;
  next_billing_date?: string;
  billing_cycle?: string;
  amount?: number;
  currency?: string;
  status?: string;
  source?: {
    email_id?: string;
    from?: string;
  };
}

/* =======================
   Existing types (เก็บไว้ ไม่ต้องลบ)
======================= */
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

/* =======================
   API Service
======================= */
class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /* =======================
     🔴 ใช้จริงตอนนี้
  ======================= */
  async getSubscriptions(): Promise<Subscription[]> {
    const response = await fetch(`${this.baseUrl}/subscriptions`, {
      signal: AbortSignal.timeout(15000),
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // ❌ เอา Authorization ออกก่อน
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subscriptions');
    }

    return response.json();
  }

  /* =======================
     🟡 ฟังก์ชันด้านล่าง "ยังไม่ใช้"
     (เก็บไว้สำหรับ backend Go ในอนาคต)
  ======================= */

  async googleSignIn(credential: string): Promise<GoogleAuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });

    if (!response.ok) {
      throw new Error('Failed to authenticate with Google');
    }

    return response.json();
  }

  async initiateGmailConnection(email: string): Promise<GmailConnectResponse> {
    const redirectUri = `${window.location.origin}/gmail-callback`;

    const response = await fetch(`${this.baseUrl}/gmail/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify({ email, redirectUri }),
    });

    if (!response.ok) {
      throw new Error('Failed to initiate Gmail connection');
    }

    return response.json();
  }

  async completeGmailConnection(
    code: string,
    state: string
  ): Promise<GmailCallbackResponse> {
    const response = await fetch(`${this.baseUrl}/gmail/callback`, {
      signal: AbortSignal.timeout(15000),
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

  /* =======================
     Helpers
  ======================= */
  private getAuthToken(): string {
    return localStorage.getItem('authToken') || '';
  }

  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  clearAuthToken(): void {
    localStorage.removeItem('authToken');
  }
}

export const apiService = new ApiService();
