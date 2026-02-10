# 🔗 Integration Guide: Frontend + Go Backend

คู่มือการเชื่อมต่อระหว่าง React Frontend กับ Go Backend สำหรับระบบ SubTrack

## 📋 สารบัญ

1. [ภาพรวมระบบ](#ภาพรวมระบบ)
2. [OAuth Flow](#oauth-flow)
3. [การติดตั้ง](#การติดตั้ง)
4. [การทำงานของแต่ละส่วน](#การทำงานของแต่ละส่วน)
5. [ตัวอย่าง Code Flow](#ตัวอย่าง-code-flow)

---

## 🎯 ภาพรวมระบบ

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  React Frontend │  HTTP   │   Go Backend    │  OAuth  │  Google APIs    │
│  (Port 3000)    │◄───────►│   (Port 8080)   │◄───────►│  (OAuth/Gmail)  │
└─────────────────┘         └─────────────────┘         └─────────────────┘
        │                            │
        │                            │
        └────────────────┬───────────┘
                         ▼
                  ┌──────────────┐
                  │   Database   │
                  │ (PostgreSQL) │
                  └──────────────┘
```

---

## 🔐 OAuth Flow

### 1. Login Flow (Google Sign-In)

```
┌────────┐                 ┌─────────┐                ┌────────┐
│ User   │                 │ Backend │                │ Google │
└───┬────┘                 └────┬────┘                └───┬────┘
    │                           │                         │
    │ 1. Click "Sign in with Google"                     │
    │──────────────────────────►│                         │
    │                           │                         │
    │                           │ 2. Redirect to Google  │
    │                           │────────────────────────►│
    │                           │                         │
    │                      3. User authorizes            │
    │◄───────────────────────────────────────────────────│
    │                           │                         │
    │ 4. Google callback with code                       │
    │──────────────────────────►│                         │
    │                           │                         │
    │                           │ 5. Exchange code for token
    │                           │────────────────────────►│
    │                           │                         │
    │                           │◄────────────────────────│
    │                           │                         │
    │ 6. Return JWT + user info │                         │
    │◄──────────────────────────│                         │
    │                           │                         │
```

**Step-by-Step:**

1. **Frontend**: User กด "Continue with Google"
   ```typescript
   const handleGoogleSignIn = () => {
     window.location.href = 'http://localhost:8080/api/auth/google/login';
   };
   ```

2. **Backend**: Redirect ไป Google OAuth
   ```go
   func (s *AuthService) GoogleLoginRedirect(c *gin.Context) {
     url := s.googleConfig.AuthCodeURL(state, oauth2.AccessTypeOffline)
     c.Redirect(http.StatusTemporaryRedirect, url)
   }
   ```

3. **Google**: User authorize แอป

4. **Google → Backend**: Callback พร้อม authorization code
   ```
   GET /api/auth/google/callback?code=xxx&state=yyy
   ```

5. **Backend**: แลก code เป็น access token
   ```go
   token, err := s.googleConfig.Exchange(ctx, code)
   ```

6. **Backend → Frontend**: Redirect พร้อม JWT
   ```
   Redirect to: http://localhost:3000/app?token=jwt_token
   ```

7. **Frontend**: เก็บ token ใน localStorage
   ```typescript
   useEffect(() => {
     const token = new URLSearchParams(location.search).get('token');
     if (token) {
       apiService.setAuthToken(token);
       navigate('/app');
     }
   }, []);
   ```

---

### 2. Gmail Connection Flow

```
┌────────┐            ┌─────────┐            ┌────────┐
│ User   │            │ Backend │            │ Google │
└───┬────┘            └────┬────┘            └───┬────┘
    │                      │                     │
    │ 1. Enter Gmail       │                     │
    │─────────────────────►│                     │
    │                      │                     │
    │ 2. Get OAuth URL     │                     │
    │◄─────────────────────│                     │
    │                      │                     │
    │ 3. Redirect to Google                      │
    │───────────────────────────────────────────►│
    │                      │                     │
    │              4. User authorizes            │
    │◄───────────────────────────────────────────│
    │                      │                     │
    │ 5. Callback with code                      │
    │─────────────────────►│                     │
    │                      │                     │
    │                      │ 6. Exchange for token
    │                      │────────────────────►│
    │                      │                     │
    │                      │ 7. Start scanning  │
    │                      │       emails        │
    │                      │                     │
    │ 8. Success response  │                     │
    │◄─────────────────────│                     │
    │                      │                     │
```

**Step-by-Step:**

1. **Frontend**: User กรอก Gmail address และกด Connect
   ```typescript
   const handleConnectGmail = async (e: React.FormEvent) => {
     e.preventDefault();
     
     const response = await apiService.initiateGmailConnection(email);
     window.location.href = response.authUrl;
   };
   ```

2. **Backend**: สร้าง OAuth URL
   ```go
   func (s *GmailService) InitiateConnection(c *gin.Context) {
     authURL := s.config.AuthCodeURL(state, oauth2.AccessTypeOffline)
     c.JSON(200, ConnectResponse{AuthURL: authURL, State: state})
   }
   ```

3. **Frontend**: Redirect ไป Google

4. **Google**: User authorize Gmail access

5. **Google → Frontend**: Callback
   ```
   GET /gmail-callback?code=xxx&state=yyy
   ```

6. **Frontend → Backend**: ส่ง code ไปแลกเป็น token
   ```typescript
   const response = await apiService.completeGmailConnection(code, state);
   ```

7. **Backend**: แลก code, เก็บ token, และเริ่ม scan emails
   ```go
   func (s *GmailService) HandleCallback(c *gin.Context) {
     token, _ := s.config.Exchange(ctx, code)
     // Store token in database
     // Start background email scanning
     go s.scanAndStoreSubscriptions(userID, gmailService)
   }
   ```

8. **Backend → Frontend**: ส่งผลลัพธ์กลับ
   ```json
   {
     "success": true,
     "email": "user@gmail.com",
     "subscriptionsFound": 5
   }
   ```

---

## 🛠️ การติดตั้ง

### Frontend Setup

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd subtrack
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env
   ```
   
   แก้ไข `.env`:
   ```env
   VITE_API_URL=http://localhost:8080/api
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```
   
   Frontend จะรันที่: `http://localhost:3000`

---

### Backend Setup

1. **Navigate to backend folder**
   ```bash
   cd backend-examples
   ```

2. **Install Go** (ถ้ายังไม่มี)
   ```bash
   # macOS
   brew install go
   
   # หรือดาวน์โหลดจาก https://golang.org/dl/
   ```

3. **Install dependencies**
   ```bash
   go mod download
   ```

4. **Setup Google OAuth**
   
   a. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
   
   b. สร้าง Project ใหม่
   
   c. Enable APIs:
      - Google+ API
      - Gmail API
   
   d. สร้าง OAuth 2.0 credentials:
      - Application type: **Web application**
      - Name: `SubTrack`
      - Authorized redirect URIs:
        - `http://localhost:3000/auth/callback`
        - `http://localhost:3000/gmail-callback`
   
   e. Copy **Client ID** และ **Client Secret**

5. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   แก้ไข `.env`:
   ```env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URL=http://localhost:3000/auth/callback
   GMAIL_REDIRECT_URL=http://localhost:3000/gmail-callback
   JWT_SECRET=your-super-secret-key
   ```

6. **Run backend server**
   ```bash
   go run .
   ```
   
   Backend จะรันที่: `http://localhost:8080`

---

## 🔄 การทำงานของแต่ละส่วน

### Frontend Components

#### 1. **Login.tsx** - หน้า Login
```typescript
// สิ่งที่ทำ:
// - แสดงฟอร์ม login
// - มีปุ่ม "Continue with Google"
// - Redirect ไป backend OAuth endpoint

const handleGoogleSignIn = () => {
  const googleAuthUrl = `${API_URL}/auth/google/login`;
  window.location.href = googleAuthUrl;
};
```

#### 2. **AddGmail.tsx** - หน้าเพิ่ม Gmail
```typescript
// สิ่งที่ทำ:
// - แสดงฟอร์มกรอก Gmail address
// - เรียก API เพื่อขอ OAuth URL
// - Redirect ไป Google OAuth

const handleConnectGmail = async (e) => {
  const response = await apiService.initiateGmailConnection(email);
  window.location.href = response.authUrl;  // Redirect to Google
};
```

#### 3. **GmailCallback.tsx** - รับ OAuth callback
```typescript
// สิ่งที่ทำ:
// - รับ code และ state จาก URL query
// - ส่งไป backend เพื่อแลกเป็น token
// - แสดงผลลัพธ์และ redirect กลับ dashboard

useEffect(() => {
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  
  const response = await apiService.completeGmailConnection(code, state);
  // Show success, redirect to /app
}, []);
```

#### 4. **apiService.ts** - API Service
```typescript
// สิ่งที่ทำ:
// - จัดการ HTTP requests ทั้งหมด
// - เก็บและส่ง JWT token
// - Handle errors

class ApiService {
  async initiateGmailConnection(email: string) {
    const response = await fetch(`${this.baseUrl}/gmail/connect`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    return response.json();
  }
}
```

---

### Backend Services

#### 1. **auth_service.go** - Authentication
```go
// สิ่งที่ทำ:
// - จัดการ Google OAuth สำหรับ login
// - Generate JWT tokens
// - Verify user credentials

func (s *AuthService) GoogleLoginCallback(c *gin.Context) {
  // 1. รับ code จาก Google
  code := c.Query("code")
  
  // 2. แลก code เป็น access token
  token, _ := s.googleConfig.Exchange(ctx, code)
  
  // 3. ดึงข้อมูล user จาก Google
  // 4. สร้าง/อัพเดท user ใน database
  // 5. Generate JWT token
  jwtToken := generateJWT(user.ID, user.Email)
  
  // 6. Redirect กลับ frontend พร้อม token
  c.Redirect(302, fmt.Sprintf("%s/app?token=%s", frontendURL, jwtToken))
}
```

#### 2. **gmail_service.go** - Gmail Integration
```go
// สิ่งที่ทำ:
// - จัดการ Gmail OAuth
// - Scan emails หา subscriptions
// - เก็บ Gmail tokens

func (s *GmailService) InitiateConnection(c *gin.Context) {
  // 1. สร้าง OAuth URL พร้อม state token
  authURL := s.config.AuthCodeURL(state)
  
  // 2. ส่ง URL กลับไป frontend
  c.JSON(200, ConnectResponse{AuthURL: authURL})
}

func (s *GmailService) HandleCallback(c *gin.Context) {
  // 1. แลก code เป็น Gmail access token
  token, _ := s.config.Exchange(ctx, code)
  
  // 2. เก็บ token ใน database
  // 3. เริ่ม background job scan emails
  go s.scanAndStoreSubscriptions(userID, gmailService)
}

func (s *GmailService) scanAndStoreSubscriptions(userID, gmailService) {
  // 1. ค้นหา emails ที่เกี่ยวกับ subscriptions
  messages := gmailService.Users.Messages.List("me").Q("subject:receipt")
  
  // 2. วิเคราะห์แต่ละ email (ใช้ AI หรือ pattern matching)
  // 3. แยกข้อมูล: ชื่อ, ราคา, วันหมดอายุ
  // 4. บันทึกลง database
}
```

#### 3. **middleware.go** - JWT Validation
```go
// สิ่งที่ทำ:
// - ตรวจสอบ JWT token ในทุก request
// - Extract user info จาก token

func AuthMiddleware() gin.HandlerFunc {
  return func(c *gin.Context) {
    // 1. ดึง token จาก Authorization header
    authHeader := c.GetHeader("Authorization")
    
    // 2. Validate JWT token
    token, err := jwt.Parse(tokenString, ...)
    
    // 3. Extract user_id และเก็บไว้ใน context
    c.Set("user_id", claims["user_id"])
  }
}
```

---

## 📝 ตัวอย่าง Code Flow

### Scenario 1: User Login ด้วย Google

**Frontend (Login.tsx):**
```typescript
const handleGoogleSignIn = () => {
  // Redirect to backend OAuth endpoint
  window.location.href = 'http://localhost:8080/api/auth/google/login';
};
```

**Backend (auth_service.go):**
```go
// Endpoint: GET /api/auth/google/login
func GoogleLoginRedirect(c *gin.Context) {
  url := googleConfig.AuthCodeURL("state")
  c.Redirect(302, url)  // Redirect to Google
}

// Endpoint: GET /api/auth/google/callback
func GoogleLoginCallback(c *gin.Context) {
  code := c.Query("code")
  token, _ := googleConfig.Exchange(ctx, code)
  
  // Get user info
  user := getUserFromGoogle(token)
  
  // Generate JWT
  jwtToken := generateJWT(user.ID)
  
  // Redirect to frontend
  c.Redirect(302, "http://localhost:3000/app?token="+jwtToken)
}
```

**Frontend (App.tsx หรือ useEffect):**
```typescript
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const token = params.get('token');
  
  if (token) {
    apiService.setAuthToken(token);  // Save to localStorage
    navigate('/app');  // Go to dashboard
  }
}, []);
```

---

### Scenario 2: User เพิ่ม Gmail Account

**Frontend (AddGmail.tsx):**
```typescript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Step 1: Request OAuth URL from backend
  const response = await fetch('http://localhost:8080/api/gmail/connect', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      email: 'user@gmail.com',
      redirectUri: 'http://localhost:3000/gmail-callback'
    }),
  });
  
  const data = await response.json();
  
  // Step 2: Redirect to Google OAuth
  window.location.href = data.authUrl;
};
```

**Backend (gmail_service.go):**
```go
// Endpoint: POST /api/gmail/connect
func InitiateConnection(c *gin.Context) {
  userID := c.GetString("user_id")  // From JWT middleware
  
  // Generate OAuth URL
  state := base64.Encode(userID + ":" + email)
  authURL := gmailConfig.AuthCodeURL(state)
  
  c.JSON(200, gin.H{
    "authUrl": authURL,
    "state": state,
  })
}
```

**Google → Frontend:**
```
Redirect to: http://localhost:3000/gmail-callback?code=xxx&state=yyy
```

**Frontend (GmailCallback.tsx):**
```typescript
useEffect(() => {
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  
  // Send code to backend
  const response = await fetch('http://localhost:8080/api/gmail/callback', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code, state }),
  });
  
  const data = await response.json();
  // data = { success: true, email: "...", subscriptionsFound: 5 }
  
  // Show success and redirect
  setTimeout(() => navigate('/app'), 2000);
}, []);
```

**Backend (gmail_service.go):**
```go
// Endpoint: POST /api/gmail/callback
func HandleCallback(c *gin.Context) {
  code := request.Code
  state := request.State
  
  // Exchange code for token
  token, _ := gmailConfig.Exchange(ctx, code)
  
  // Save token to database
  db.SaveGmailToken(userID, token)
  
  // Start background email scan
  go scanAndStoreSubscriptions(userID, token)
  
  c.JSON(200, gin.H{
    "success": true,
    "email": "user@gmail.com",
    "subscriptionsFound": 5,
  })
}

// Background function
func scanAndStoreSubscriptions(userID, token) {
  gmailService := createGmailService(token)
  
  // Search for subscription emails
  messages := gmailService.Users.Messages.List("me").
    Q("subject:(receipt OR invoice OR subscription)").
    Do()
  
  for _, msg := range messages {
    // Extract subscription info
    sub := extractSubscriptionInfo(msg)
    
    // Save to database
    db.CreateSubscription(userID, sub)
  }
}
```

---

## 🔒 Security Checklist

- ✅ ใช้ HTTPS ใน production
- ✅ เก็บ JWT secret ปลอดภัย
- ✅ Validate state token ใน OAuth callback
- ✅ เข้ารหัส Gmail tokens ก่อนเก็บ database
- ✅ ตั้งค่า CORS ให้ถูกต้อง
- ✅ Implement rate limiting
- ✅ Use environment variables สำหรับ sensitive data

---

## 🐛 Common Issues & Solutions

### Issue 1: CORS Error
```
Access to fetch blocked by CORS policy
```

**Solution:** ตรวจสอบ CORS config ใน backend
```go
r.Use(cors.New(cors.Config{
  AllowOrigins: []string{"http://localhost:3000"},
  AllowHeaders: []string{"Authorization", "Content-Type"},
}))
```

### Issue 2: OAuth Redirect Mismatch
```
Error 400: redirect_uri_mismatch
```

**Solution:** ตรวจสอบว่า redirect URI ใน:
1. Google Cloud Console
2. `.env` file
3. Frontend code

ต้องตรงกันทุกที่

### Issue 3: JWT Token Expired
```
Error 401: Unauthorized
```

**Solution:** Implement refresh token logic หรือให้ user login ใหม่

---

## 📞 Support

หากมีปัญหา สามารถเช็คได้ที่:
- Backend logs: ดูที่ terminal ที่รัน `go run .`
- Frontend logs: ดูที่ browser console (F12)
- Network requests: ดูที่ Network tab ใน DevTools

---

**Happy Coding! 🚀**
