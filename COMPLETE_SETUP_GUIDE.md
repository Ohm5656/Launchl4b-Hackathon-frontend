# 🚀 SubTrack - Complete Setup Guide

คู่มือฉบับสมบูรณ์สำหรับการรันระบบ SubTrack แบบเต็มรูปแบบ (Frontend + Backend)

---

## 📦 สิ่งที่คุณจะได้

### ✅ **Continue with Google** (Login)
- Sign in ด้วย Google
- สร้าง user session
- เข้าสู่ Dashboard

### ✅ **Add Gmail** (Gmail Scanning)
- เชื่อมต่อ Gmail account
- Backend สแกน Gmail อัตโนมัติ
- แสดงผล subscriptions ที่พบ
- กลับมาหน้า Dashboard พร้อมข้อมูล

---

## 📋 Prerequisites

ก่อนเริ่มต้อง install:

1. **Node.js** (v18 หรือสูงกว่า)
2. **Go** (v1.21 หรือสูงกว่า)
3. **Google Cloud Console** account

---

## 🔐 Part 1: Google OAuth Setup

### 1. สร้าง Google Cloud Project

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้าง Project ใหม่ชื่อ **"SubTrack"**
3. Enable APIs:
   - **Google+ API** (หรือ **People API**)
   - **Gmail API**

### 2. ตั้งค่า OAuth Consent Screen

1. ไปที่ **APIs & Services** > **OAuth consent screen**
2. เลือก **External**
3. กรอกข้อมูล:
   - **App name:** `SubTrack`
   - **User support email:** `your-email@gmail.com`
   - **Developer contact:** `your-email@gmail.com`

4. **Scopes:**
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `.../auth/gmail.readonly`

5. **Test users:**
   - เพิ่ม Gmail ที่จะใช้ทดสอบ

### 3. สร้าง OAuth 2.0 Client ID

1. ไปที่ **Credentials** > **Create Credentials** > **OAuth client ID**
2. Application type: **Web application**
3. Name: `SubTrack Web Client`

**Authorized JavaScript origins:**
```
http://localhost:3000
http://localhost:5173
```

**Authorized redirect URIs:**
```
http://localhost:3000/
http://localhost:3000/gmail-callback
http://localhost:8080/api/auth/google/callback
http://localhost:8080/api/gmail/callback/redirect
```

4. **คัดลอก Client ID และ Client Secret** เก็บไว้

---

## 🔧 Part 2: Backend Setup

### 1. Navigate to Backend

```bash
cd backend-examples
```

### 2. Install Dependencies

```bash
go mod download
```

หรือถ้ายังไม่มี `go.mod`:

```bash
go mod init subtrack-backend
go get github.com/gin-gonic/gin
go get github.com/gin-contrib/cors
go get github.com/joho/godotenv
go get golang.org/x/oauth2
go get golang.org/x/oauth2/google
go get google.golang.org/api/gmail/v1
go get github.com/golang-jwt/jwt/v5
```

### 3. สร้างไฟล์ `.env`

```bash
cp .env.example .env
```

**แก้ไข `.env`:**

```env
# Server
PORT=8080
FRONTEND_URL=http://localhost:3000

# Google OAuth (ใส่ค่าจาก Google Console)
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456ghi789

# Redirect URLs
GOOGLE_REDIRECT_URL=http://localhost:8080/api/auth/google/callback
GMAIL_REDIRECT_URL=http://localhost:8080/api/gmail/callback/redirect

# JWT Secret (สร้างใหม่ด้วย: openssl rand -base64 32)
JWT_SECRET=your-random-secret-key-change-this
```

⚠️ **แทนที่:**
- `GOOGLE_CLIENT_ID` - จาก Google Console
- `GOOGLE_CLIENT_SECRET` - จาก Google Console
- `JWT_SECRET` - สร้างใหม่ (ใช้ `openssl rand -base64 32`)

### 4. Run Backend

```bash
go run .
```

**ควรเห็น:**
```
Server starting on port 8080
```

**ทดสอบ:**
```bash
curl http://localhost:8080/health
# ควรได้: {"status":"ok"}
```

---

## 💻 Part 3: Frontend Setup

### 1. กลับไป Root Directory

```bash
cd ..
```

### 2. Install Dependencies

```bash
npm install
```

### 3. สร้างไฟล์ `.env`

```bash
cp .env.example .env
```

**แก้ไข `.env`:**

```env
# Backend API URL
VITE_API_URL=http://localhost:8080/api

# Google OAuth Client ID (เหมือนกับ Backend)
VITE_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
```

⚠️ **แทนที่:**
- `VITE_GOOGLE_CLIENT_ID` - จาก Google Console (ใช้ตัวเดียวกับ Backend)

### 4. Run Frontend

```bash
npm run dev
```

**ควรเห็น:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
```

---

## 🧪 Part 4: ทดสอบระบบ

### Test 1: Continue with Google (Login)

1. เปิด **http://localhost:3000**
2. คลิก **"Continue with Google"**
3. เลือก Google account
4. Authorize
5. ควรกลับมาหน้า Dashboard ✅

**ถ้าเจอปัญหา:**
- เช็ค Backend logs
- เช็ค Browser Console
- เช็ค redirect URI ใน Google Console

---

### Test 2: Add Gmail (Gmail Scanning)

1. ไปที่ Dashboard (`/app`)
2. คลิก **"Add Gmail"**
3. กรอก Gmail: `your.test@gmail.com`
4. คลิก **"Connect Gmail Account"**
5. จะถูก redirect ไป Backend
6. Backend redirect ไป Google OAuth
7. Authorize Gmail access
8. Google redirect กลับ Backend
9. Backend สแกน Gmail
10. Backend redirect กลับ Frontend Dashboard ✅

**ควรเห็น:**
- ✅ Success toast: "Gmail connected successfully!"
- ✅ Info toast: "Scanning your.test@gmail.com for subscriptions..."
- ✅ หลัง 3 วินาที Dashboard จะแสดง subscriptions ที่สแกนได้

**ดู Backend logs:**
```
✅ Gmail connected: your.test@gmail.com
✅ Found subscription: Netflix - $9.99
✅ Found subscription: Spotify - $9.99
📧 Finished scanning Gmail. Found 2 subscriptions
```

---

## 🎯 ระบบทำงานอย่างไร

### Flow: Add Gmail → Scan → Display

```
┌─────────────────────┐
│ User clicks         │
│ "Add Gmail"         │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Frontend redirects  │
│ to Backend          │
│ /api/gmail/connect  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Backend generates   │
│ OAuth URL & cookies │
│ Redirect to Google  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Google OAuth        │
│ User authorizes     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Google redirects    │
│ to Backend callback │
│ with code           │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Backend:            │
│ 1. Exchange token   │
│ 2. Connect Gmail    │
│ 3. Scan emails ⚡   │
│ 4. Store subs       │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Backend redirects   │
│ to Frontend         │
│ /app?gmail_...      │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Frontend:           │
│ 1. Show toast       │
│ 2. Fetch API        │
│ 3. Display subs 🎉  │
└─────────────────────┘
```

---

## 📁 ไฟล์สำคัญ

### Backend ✅ (ทำพร้อมแล้ว)

```
backend-examples/
├── main.go                    # Routes & server
├── auth_service.go            # Google Sign-In
├── gmail_service.go           # Gmail OAuth & scanning
├── subscription_service.go    # Subscription API
├── storage.go                 # In-memory storage
├── middleware.go              # Auth middleware
├── go.mod                     # Dependencies
└── .env                       # Configuration
```

### Frontend ✅ (ทำพร้อมแล้ว)

```
src/
├── app/
│   ├── pages/
│   │   ├── LoginPage.tsx      # Continue with Google
│   │   ├── DashboardPage.tsx  # แสดง subscriptions
│   │   └── AddGmailPage.tsx   # Add Gmail form
│   ├── components/
│   │   ├── Dashboard.tsx      # Dashboard UI
│   │   └── AddGmail.tsx       # Gmail connection
│   └── services/
│       └── api.ts             # API calls
└── .env                        # Configuration
```

---

## 🔍 Backend APIs

### Health Check
```bash
GET /health
# Response: {"status":"ok"}
```

### Get Subscriptions
```bash
GET /api/subscriptions
# Response: {
#   "subscriptions": [...],
#   "total": 5
# }
```

### Gmail Connect (Redirect Flow)
```bash
GET /api/gmail/connect/redirect?email=user@gmail.com
# → Redirects to Google OAuth
```

### Gmail Callback
```bash
GET /api/gmail/callback/redirect?code=xxx&state=yyy
# → Scans Gmail
# → Redirects to /app?gmail_connected=true&email=...
```

---

## 🐛 Troubleshooting

### ปัญหา: "Failed to fetch"

**สาเหตุ:** Backend ไม่รัน

**วิธีแก้:**
```bash
cd backend-examples
go run .
```

### ปัญหา: "redirect_uri_mismatch"

**สาเหตุ:** Redirect URI ไม่ตรง

**วิธีแก้:**
1. ไปที่ Google Console > Credentials
2. Edit OAuth Client
3. ตรวจสอบว่ามี:
   - `http://localhost:8080/api/gmail/callback/redirect`
   - `http://localhost:8080/api/auth/google/callback`
4. Save

### ปัญหา: "invalid_state"

**สาเหตุ:** Cookie ไม่ทำงาน

**วิธีแก้:**
- ตรวจสอบ Browser อนุญาต cookies
- ลองใช้ Incognito mode
- ตรวจสอบ CORS settings

### ปัญหา: ไม่มี subscriptions แสดง

**เช็ค Backend logs:**
```
✅ Gmail connected: user@gmail.com
📧 Finished scanning Gmail. Found 0 subscriptions
```

**สาเหตุ:**
- Gmail ไม่มีอีเมล subscription
- Pattern matching ไม่จับ

**วิธีแก้:**
- ลองส่งอีเมลทดสอบ (subject: "Netflix receipt")
- หรือแก้ pattern ใน `gmail_service.go`

---

## 📊 ทดสอบว่าระบบทำงาน

### ✅ Checklist

- [ ] Backend รันที่ port 8080
- [ ] Frontend รันที่ port 3000
- [ ] Google OAuth Client ID setup แล้ว
- [ ] Redirect URIs เพิ่มครบทั้งหมด
- [ ] Gmail API enabled
- [ ] Test user เพิ่มใน OAuth consent screen
- [ ] ทดสอบ "Continue with Google" สำเร็จ
- [ ] ทดสอบ "Add Gmail" สำเร็จ
- [ ] เห็น subscriptions ใน Dashboard

---

## 🚀 Production Deployment

เมื่อต้องการ deploy:

### 1. Update Google Console

**Authorized redirect URIs:**
```
https://your-domain.com/
https://your-domain.com/gmail-callback
https://api.your-domain.com/api/auth/google/callback
https://api.your-domain.com/api/gmail/callback/redirect
```

### 2. Update Backend .env

```env
FRONTEND_URL=https://your-domain.com
GOOGLE_REDIRECT_URL=https://api.your-domain.com/api/auth/google/callback
GMAIL_REDIRECT_URL=https://api.your-domain.com/api/gmail/callback/redirect
```

### 3. Update Frontend .env

```env
VITE_API_URL=https://api.your-domain.com/api
```

### 4. Build

**Backend:**
```bash
go build -o subtrack-backend
```

**Frontend:**
```bash
npm run build
```

---

## 📚 เอกสารเพิ่มเติม

- `GOOGLE_OAUTH_SETUP.md` - คู่มือ Google OAuth ละเอียด
- `BACKEND_FLOW_GUIDE.md` - Flow diagram แบบละเอียด
- `backend-examples/README.md` - Backend documentation

---

## ❓ FAQ

**Q: ต้องใช้ Gmail จริงหรือไม่?**
A: ใช่ ต้องใช้ Gmail account จริงที่เพิ่มเป็น Test user ใน OAuth consent screen

**Q: Backend เก็บข้อมูลที่ไหน?**
A: ตอนนี้ใช้ In-memory storage (ข้อมูลหายเมื่อ restart) สำหรับ production ต้องเชื่อม database

**Q: Pattern matching หา subscription แม่นยำแค่ไหน?**
A: ตอนนี้เป็น simple keyword matching สำหรับ production ควรใช้ AI/ML

**Q: ทำไมต้องรอ 3 วินาที?**
A: เพื่อให้ backend scan Gmail เสร็จก่อน (background process)

---

**เรียบร้อย! ระบบพร้อมใช้งาน 🎉**

หากมีปัญหา ดู Backend logs และ Browser console เพื่อ debug
