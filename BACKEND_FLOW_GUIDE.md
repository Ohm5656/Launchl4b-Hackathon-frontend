# 🔄 Gmail Backend Flow Guide

คู่มือนี้อธิบายการทำงานของ Gmail connection flow แบบใช้ backend

---

## 🎯 Flow Overview

### แบบที่ 1: Frontend Direct (ไม่มี Backend)
```
User → Google OAuth → Frontend Callback → แสดง Success (demo mode)
```

### แบบที่ 2: Backend Flow (มี Backend)
```
User → Backend → Google OAuth → Backend Callback → Scan Gmail → Redirect to Frontend Dashboard
```

---

## 🔄 Backend Flow ทำงานอย่างไร

### Step 1: User คลิก "Connect Gmail Account"

**Frontend (AddGmail.tsx):**
```typescript
// ตรวจสอบว่า backend รันอยู่หรือไม่
const backendAvailable = await checkBackendAvailability();

if (backendAvailable) {
  // Redirect ไป backend
  window.location.href = `${backendUrl}/gmail/connect/redirect?email=${email}`;
}
```

**URL:**
```
http://localhost:8080/api/gmail/connect/redirect?email=user@gmail.com
```

---

### Step 2: Backend สร้าง OAuth URL และ Redirect

**Backend (gmail_service.go → InitiateConnectionRedirect):**
```go
func (s *GmailService) InitiateConnectionRedirect(c *gin.Context) {
  email := c.Query("email")
  
  // สร้าง state token
  state := generateState(userID, email)
  
  // เก็บ state ใน cookie
  c.SetCookie("gmail_state", state, 3600, "/", "", false, true)
  
  // สร้าง Google OAuth URL
  authURL := s.config.AuthCodeURL(state, 
    oauth2.AccessTypeOffline,
    oauth2.ApprovalForce,
  )
  
  // Redirect ไป Google
  c.Redirect(http.StatusTemporaryRedirect, authURL)
}
```

**Redirect to:**
```
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=http://localhost:8080/api/gmail/callback/redirect&
  response_type=code&
  scope=https://www.googleapis.com/auth/gmail.readonly&
  state=xxx&
  access_type=offline&
  prompt=consent
```

---

### Step 3: User Authorize บน Google

User เห็นหน้า Google OAuth consent screen และอนุญาต:
- ✅ Read email messages
- ✅ View email settings

---

### Step 4: Google Redirect กลับ Backend

**Google redirect to:**
```
http://localhost:8080/api/gmail/callback/redirect?code=xxx&state=yyy
```

**Backend (gmail_service.go → HandleCallbackRedirect):**
```go
func (s *GmailService) HandleCallbackRedirect(c *gin.Context) {
  code := c.Query("code")
  state := c.Query("state")
  
  // 1. ตรวจสอบ state token
  savedState, _ := c.Cookie("gmail_state")
  if savedState != state {
    c.Redirect(frontendURL+"/app?error=invalid_state")
    return
  }
  
  // 2. แลก code เป็น access token
  token, err := s.config.Exchange(ctx, code)
  
  // 3. สร้าง Gmail service
  gmailService, err := gmail.NewService(ctx, 
    option.WithTokenSource(s.config.TokenSource(ctx, token)))
  
  // 4. ดึง Gmail profile
  profile, err := gmailService.Users.GetProfile("me").Do()
  
  // 5. เก็บ token ใน database
  // storeGmailToken(userID, token)
  
  // 6. เริ่มสแกน Gmail ใน background
  go s.scanAndStoreSubscriptions(userID, gmailService)
  
  // 7. Redirect กลับ frontend
  c.Redirect(frontendURL+"/app?gmail_connected=true&email="+profile.EmailAddress)
}
```

---

### Step 5: Backend Scans Gmail

**Background process:**
```go
func (s *GmailService) scanAndStoreSubscriptions(userID string, gmailService *gmail.Service) {
  // ค้นหาอีเมลที่เกี่ยวข้องกับ subscription
  queries := []string{
    "subject:(receipt OR invoice OR subscription OR renewal OR payment)",
    "from:(noreply OR no-reply OR billing OR subscriptions)",
  }
  
  for _, query := range queries {
    messages, _ := gmailService.Users.Messages.List("me").
      Q(query).
      MaxResults(100).
      Do()
    
    for _, msg := range messages.Messages {
      message, _ := gmailService.Users.Messages.Get("me", msg.Id).Do()
      
      // ใช้ AI/pattern matching หา subscription info
      sub := s.extractSubscriptionInfo(message)
      if sub != nil {
        // บันทึกลง database
        saveSubscription(userID, sub)
      }
    }
  }
}
```

---

### Step 6: Frontend แสดง Success Message

**Frontend (DashboardPage.tsx):**
```typescript
useEffect(() => {
  const gmailConnected = searchParams.get('gmail_connected');
  const email = searchParams.get('email');
  
  if (gmailConnected === 'true' && email) {
    toast.success(`Gmail connected successfully!`);
    toast.info(`Now scanning ${email} for subscriptions...`);
  }
}, [searchParams]);
```

---

## 📝 Environment Variables

### Frontend `.env`
```env
VITE_API_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### Backend `.env`
```env
PORT=8080
FRONTEND_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# สำคัญ: Backend callback URL
GMAIL_REDIRECT_URL=http://localhost:8080/api/gmail/callback/redirect

JWT_SECRET=your-random-secret
```

---

## 🔐 Google Console Setup

**Authorized redirect URIs ที่ต้องเพิ่ม:**
```
http://localhost:8080/api/gmail/callback/redirect
```

⚠️ **สำคัญมาก:** ต้องเพิ่ม redirect URI นี้ใน Google Cloud Console ไม่งั้นจะเจอ error `redirect_uri_mismatch`

---

## 🧪 Testing Step by Step

### 1. Setup Backend

```bash
cd backend-examples
cp .env.example .env
# แก้ไข .env ใส่ Google credentials
go run .
```

ตรวจสอบว่า backend รันที่ `http://localhost:8080`

### 2. Setup Frontend

```bash
cp .env.example .env
# แก้ไข .env ใส่ VITE_API_URL และ VITE_GOOGLE_CLIENT_ID
npm run dev
```

### 3. ทดสอบ Flow

1. เปิด `http://localhost:3000`
2. Login หรือไปที่ `/app` ตรงๆ
3. คลิก **"Add Gmail"**
4. กรอก Gmail address: `your.email@gmail.com`
5. คลิก **"Connect Gmail Account"**
6. ดู Network tab ใน DevTools:
   - ควรเห็น request ไป `/api/health` (ตรวจสอบ backend)
   - แล้ว redirect ไป `http://localhost:8080/api/gmail/connect/redirect?email=...`
7. Backend จะ redirect ไปหน้า Google OAuth
8. Authorize บน Google
9. Google redirect กลับ backend: `http://localhost:8080/api/gmail/callback/redirect?code=...`
10. Backend ประมวลผลแล้ว redirect กลับ: `http://localhost:3000/app?gmail_connected=true&email=...`
11. ควรเห็น success toast! 🎉

---

## 🐛 Troubleshooting

### Error: "Failed to fetch"

**สาเหตุ:** Backend ไม่รัน

**วิธีแก้:**
```bash
cd backend-examples
go run .
```

### Error: "redirect_uri_mismatch"

**สาเหตุ:** Redirect URI ไม่ตรงใน Google Console

**วิธีแก้:**
1. ไปที่ Google Cloud Console > Credentials
2. Edit OAuth Client
3. เพิ่ม: `http://localhost:8080/api/gmail/callback/redirect`
4. Save

### Error: "invalid_state"

**สาเหตุ:** State token ไม่ตรงกัน (อาจเป็นเพราะ cookie ไม่ทำงาน)

**วิธีแก้:**
- ลองใหม่อีกครั้ง
- เช็คว่า browser อนุญาต cookies
- ตรวจสอบว่า CORS settings ถูกต้อง

### Backend ไม่ scan Gmail

**วิธีเช็ค:**
1. ดู terminal ที่รัน backend
2. ควรเห็น log: `✅ Gmail connected: user@gmail.com`
3. และ log: `Found subscription: Netflix - $9.99`

ถ้าไม่เห็น:
- ตรวจสอบว่า Gmail API enabled ใน Google Console
- เช็ค scope ใน OAuth request ว่ามี `gmail.readonly`
- ดู error log ใน backend

---

## 🔄 Flow Diagram

```
┌─────────────┐
│   User      │
│ (Browser)   │
└──────┬──────┘
       │ 1. คลิก "Connect Gmail"
       ▼
┌─────────────────────────────────┐
│ Frontend (AddGmail.tsx)         │
│ - Validate email                │
│ - Check backend availability    │
└──────┬──────────────────────────┘
       │ 2. Redirect to backend
       │    /api/gmail/connect/redirect?email=...
       ▼
┌─────────────────────────────────┐
│ Backend (InitiateConnectionRedir)│
│ - Generate state token          │
│ - Set cookie                    │
│ - Build Google OAuth URL        │
└──────┬──────────────────────────┘
       │ 3. Redirect to Google
       ▼
┌─────────────────────────────────┐
│ Google OAuth Consent Screen     │
│ - Show permissions request      │
│ - User authorizes               │
└──────┬──────────────────────────┘
       │ 4. Redirect to backend callback
       │    /api/gmail/callback/redirect?code=...
       ▼
┌─────────────────────────────────┐
│ Backend (HandleCallbackRedirect) │
│ - Verify state                  │
│ - Exchange code for token       │
│ - Create Gmail service          │
│ - Get profile                   │
│ - Start background scan         │
└──────┬──────────────────────────┘
       │ 5. Redirect to frontend
       │    /app?gmail_connected=true&email=...
       ▼
┌─────────────────────────────────┐
│ Frontend (DashboardPage.tsx)    │
│ - Show success toast            │
│ - Display scanned subscriptions │
└─────────────────────────────────┘
       │
       │ Background Process
       ▼
┌─────────────────────────────────┐
│ Backend (scanAndStore...)       │
│ - Search Gmail messages         │
│ - Extract subscription info     │
│ - Save to database              │
└─────────────────────────────────┘
```

---

## 📚 Related Files

**Frontend:**
- `/src/app/components/AddGmail.tsx` - Gmail connection form
- `/src/app/pages/DashboardPage.tsx` - Success message display
- `/src/app/services/api.ts` - API service

**Backend:**
- `/backend-examples/gmail_service.go` - Gmail OAuth & scanning
- `/backend-examples/main.go` - Routes setup
- `/backend-examples/.env` - Configuration

---

## ✅ Checklist

- [ ] Google OAuth Client ID สร้างแล้ว
- [ ] Redirect URI เพิ่มใน Google Console แล้ว
- [ ] Gmail API enabled แล้ว
- [ ] Frontend `.env` ตั้งค่าแล้ว
- [ ] Backend `.env` ตั้งค่าแล้ว
- [ ] Backend รันอยู่ที่ port 8080
- [ ] Frontend รันอยู่ที่ port 3000
- [ ] ทดสอบ flow ผ่าน
- [ ] เห็น success toast
- [ ] Backend scan Gmail สำเร็จ

---

**Happy Testing! 🎉**
