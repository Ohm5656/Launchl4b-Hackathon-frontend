# SubTrack Backend (Go)

Backend API สำหรับ SubTrack - Subscription tracker with Gmail auto-detection

## 🎯 Features

- ✅ **Google OAuth Sign-In** - Login with Google
- ✅ **Gmail OAuth Integration** - Connect Gmail accounts
- ✅ **Auto Gmail Scanning** - Automatically scan emails for subscriptions
- ✅ **Pattern Matching** - Detect subscriptions from receipts/invoices
- ✅ **RESTful API** - Get, update, delete subscriptions
- ✅ **In-Memory Storage** - Demo storage (replace with DB in production)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
go mod download
```

### 2. Setup Environment

```bash
cp .env.example .env
# Edit .env with your Google OAuth credentials
```

### 3. Run Server

```bash
go run .
```

Server runs on `http://localhost:8080`

---

## 📁 Project Structure

```
backend-examples/
├── main.go                    # Server setup & routes
├── auth_service.go            # Google Sign-In OAuth
├── gmail_service.go           # Gmail OAuth & email scanning
├── subscription_service.go    # Subscription CRUD API
├── storage.go                 # In-memory data storage
├── middleware.go              # Auth middleware (JWT)
├── go.mod                     # Dependencies
└── .env                       # Configuration (create from .env.example)
```

---

## 🔌 API Endpoints

### Health Check

```bash
GET /health
```

Response:
```json
{
  "status": "ok"
}
```

---

### Authentication

#### Google Sign-In (Login)

**Redirect to Google:**
```bash
GET /api/auth/google/login
```

**Handle Google Callback:**
```bash
GET /api/auth/google/callback?code=xxx&state=yyy
```

Response:
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "123",
    "email": "user@gmail.com",
    "name": "John Doe",
    "picture": "https://..."
  }
}
```

---

### Gmail Integration

#### Connect Gmail (Redirect Flow)

**Initiate Connection:**
```bash
GET /api/gmail/connect/redirect?email=user@gmail.com
```

This endpoint:
1. Generates OAuth URL
2. Redirects to Google OAuth consent screen

**Handle Google Callback:**
```bash
GET /api/gmail/callback/redirect?code=xxx&state=yyy
```

This endpoint:
1. Exchanges code for access token
2. Connects to Gmail API
3. **Scans emails for subscriptions** (background process)
4. Redirects to frontend: `/app?gmail_connected=true&email=...`

---

### Subscriptions

#### Get All Subscriptions

```bash
GET /api/subscriptions
```

Response:
```json
{
  "subscriptions": [
    {
      "id": "1234567890",
      "name": "Netflix",
      "price": 15.49,
      "billingCycle": "monthly",
      "nextBillingDate": "2026-02-12",
      "category": "streaming",
      "isAutoDetected": true
    }
  ],
  "total": 1
}
```

#### Get Single Subscription

```bash
GET /api/subscriptions/:id
```

#### Delete Subscription

```bash
DELETE /api/subscriptions/:id
```

---

## 🔍 Gmail Scanning Process

### How it works:

1. **Connect Gmail** - User authorizes Gmail access via OAuth
2. **Background Scan** - Server searches emails with queries:
   - `subject:(receipt OR invoice OR subscription OR renewal OR payment)`
   - `from:(noreply OR no-reply OR billing OR subscriptions)`
3. **Pattern Matching** - Detects services like:
   - Netflix
   - Spotify
   - Adobe Creative Cloud
   - YouTube Premium
   - GitHub
   - ChatGPT Plus
4. **Extract Info** - Gets subscription details:
   - Name
   - Price (would extract from email)
   - Billing cycle
   - Next billing date
5. **Store** - Saves to storage

### Current Implementation:

**File:** `gmail_service.go`

**Function:** `scanAndStoreSubscriptions()`

```go
// Searches Gmail for subscription-related emails
queries := []string{
  "subject:(receipt OR invoice OR subscription OR renewal OR payment)",
  "from:(noreply OR no-reply OR billing OR subscriptions)",
}

// Pattern matching keywords
subscriptionKeywords := map[string]struct {
  name     string
  category string
}{
  "netflix":  {"Netflix", "streaming"},
  "spotify":  {"Spotify", "streaming"},
  "adobe":    {"Adobe Creative Cloud", "productivity"},
  // ...
}
```

### Logs:

```
✅ Gmail connected: user@gmail.com
✅ Found subscription: Netflix - $9.99
✅ Found subscription: Spotify - $9.99
📧 Finished scanning Gmail. Found 2 subscriptions
```

---

## 🔐 Environment Variables

Create `.env` file:

```env
# Server Configuration
PORT=8080
FRONTEND_URL=http://localhost:3000

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# OAuth Redirect URLs
GOOGLE_REDIRECT_URL=http://localhost:8080/api/auth/google/callback
GMAIL_REDIRECT_URL=http://localhost:8080/api/gmail/callback/redirect

# JWT Secret
JWT_SECRET=your-random-secret-key
```

---

## 📊 Storage

### Current: In-Memory Storage

**File:** `storage.go`

Data structure:
```go
type Storage struct {
  subscriptions map[string][]*Subscription // userID -> subscriptions
  gmailTokens   map[string]interface{}     // userID -> OAuth token
}
```

⚠️ **Note:** Data is lost on server restart

### Production: Use Database

Replace `storage.go` with:
- PostgreSQL
- MongoDB
- MySQL

---

## 🧪 Testing

### 1. Start Server

```bash
go run .
```

### 2. Test Health Check

```bash
curl http://localhost:8080/health
```

Expected:
```json
{"status":"ok"}
```

### 3. Test Gmail Flow

1. Open browser: `http://localhost:8080/api/gmail/connect/redirect?email=test@gmail.com`
2. Authorize on Google
3. Check logs for scan results

---

## 🚀 Production Checklist

- [ ] Replace in-memory storage with database
- [ ] Add proper error logging
- [ ] Use environment-specific configs
- [ ] Add rate limiting
- [ ] Implement token refresh for Gmail
- [ ] Add webhook for real-time email updates
- [ ] Use AI/ML for better subscription detection
- [ ] Add email verification
- [ ] Implement HTTPS
- [ ] Add monitoring & alerts

---

## 📚 Dependencies

```go
require (
  github.com/gin-gonic/gin           // Web framework
  github.com/gin-contrib/cors        // CORS middleware
  github.com/joho/godotenv          // .env file loader
  golang.org/x/oauth2               // OAuth2 client
  google.golang.org/api/gmail/v1    // Gmail API
  github.com/golang-jwt/jwt/v5      // JWT tokens
)
```

Install all:
```bash
go mod download
```

---

## 🐛 Troubleshooting

### Port already in use

```bash
# Kill process on port 8080
lsof -ti:8080 | xargs kill -9
```

### Gmail API not working

1. Check Gmail API is enabled in Google Console
2. Check OAuth scopes include `gmail.readonly`
3. Check redirect URI matches exactly

### No subscriptions found

- Gmail account might not have subscription emails
- Check pattern matching keywords
- Add debug logs to `extractSubscriptionInfo()`

---

## 📖 Related Documentation

- **Main Setup:** `/COMPLETE_SETUP_GUIDE.md`
- **OAuth Setup:** `/GOOGLE_OAUTH_SETUP.md`
- **Flow Diagram:** `/BACKEND_FLOW_GUIDE.md`

---

**Happy coding! 🎉**