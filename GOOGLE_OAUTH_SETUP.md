# 🔐 วิธีการตั้งค่า Google OAuth

คู่มือนี้จะแนะนำการตั้งค่า Google OAuth เพื่อให้ปุ่ม "Continue with Google" ทำงานได้จริง

---

## 📋 ขั้นตอนการตั้งค่า

### 1. สร้าง Google Cloud Project

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. คลิก **"Select a project"** ที่มุมซายบน
3. คลิก **"New Project"**
4. ตั้งชื่อโปรเจค เช่น `SubTrack`
5. คลิก **"Create"**

### 2. Enable APIs

1. ในเมนูด้านซ้าย ไปที่ **"APIs & Services"** > **"Library"**
2. ค้นหาและ Enable APIs ต่อไปนี้:
   - **Google+ API** (หรือ **People API**)
   - **Gmail API**

### 3. สร้าง OAuth Consent Screen

1. ไปที่ **"APIs & Services"** > **"OAuth consent screen"**
2. เลือก **"External"** (ถ้าไม่มี Google Workspace)
3. คลิก **"Create"**

#### ขั้นตอนการกรอกข้อมูล:

**App information:**
- App name: `SubTrack`
- User support email: `your-email@gmail.com`
- App logo: (optional) อัพโหลดโลโก้ถ้ามี

**App domain:**
- Application home page: `http://localhost:3000`
- Privacy policy: `http://localhost:3000/privacy` (หรือเว้นว่างไว้ในระหว่าง dev)
- Terms of service: `http://localhost:3000/terms` (หรือเว้นว่างไว้ในระหว่าง dev)

**Authorized domains:**
- เพิ่ม `localhost` (ถ้าตอน production ให้ใส่ domain จริง)

**Developer contact information:**
- ใส่ email ของคุณ

4. คลิก **"Save and Continue"**

**Scopes:**
1. คลิก **"Add or Remove Scopes"**
2. เพิ่ม scopes ต่อไปนี้:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `../auth/gmail.readonly` (สำหรับสแกน Gmail)
3. คลิก **"Update"** แล้ว **"Save and Continue"**

**Test users:**
1. คลิก **"Add Users"**
2. เพิ่ม Gmail ที่จะใช้ทดสอบ (เช่น Gmail ของคุณเอง)
3. คลิก **"Save and Continue"**

4. Review และคลิก **"Back to Dashboard"**

### 4. สร้าง OAuth 2.0 Client ID

1. ไปที่ **"APIs & Services"** > **"Credentials"**
2. คลิก **"Create Credentials"** > **"OAuth client ID"**
3. เลือก Application type: **"Web application"**
4. ตั้งชื่อ: `SubTrack Web Client`

#### Authorized JavaScript origins:
```
http://localhost:3000
http://localhost:5173
```

#### Authorized redirect URIs:
```
http://localhost:3000/
http://localhost:3000/gmail-callback
http://localhost:8080/api/auth/google/callback
http://localhost:8080/api/gmail/callback/redirect
```

5. คลิก **"Create"**
6. **คัดลอก Client ID และ Client Secret** เก็บไว้

---

## 🔧 ตั้งค่า Frontend

### 1. สร้างไฟล์ `.env` ใน root folder

```bash
cp .env.example .env
```

### 2. แก้ไข `.env` และใส่ Google Client ID

```env
# Backend API URL
VITE_API_URL=http://localhost:8080/api

# Google OAuth Client ID (จาก Google Cloud Console)
VITE_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
```

**⚠️ สำคัญ:** แทนที่ `123456789-abcdefg.apps.googleusercontent.com` ด้วย Client ID จริงที่คุณได้จาก Google Cloud Console

### 3. Restart Development Server

```bash
npm run dev
```

---

## 🔧 ตั้งค่า Backend (Go)

### 1. สร้างไฟล์ `.env` ใน `backend-examples/`

```bash
cd backend-examples
cp .env.example .env
```

### 2. แก้ไข `.env`

```env
PORT=8080
FRONTEND_URL=http://localhost:3000

# Google OAuth Credentials
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456ghi789
GOOGLE_REDIRECT_URL=http://localhost:3000/
GMAIL_REDIRECT_URL=http://localhost:3000/gmail-callback

# JWT Secret (สุ่มใหม่ในการใช้งานจริง)
JWT_SECRET=your-random-secret-key-here
```

**เปลี่ยนค่าเหล่านี้:**
- `GOOGLE_CLIENT_ID`: Client ID จาก Google Console
- `GOOGLE_CLIENT_SECRET`: Client Secret จาก Google Console
- `JWT_SECRET`: สร้าง secret key ใหม่ (ใช้คำสั่ง `openssl rand -base64 32`)

### 3. Run Backend

```bash
go run .
```

---

## 🧪 ทดสอบการทำงาน

### ทดสอบด้วย Frontend เท่านั้น (ไม่มี Backend)

1. ตรวจสอบว่าตั้งค่า `VITE_GOOGLE_CLIENT_ID` ใน `.env` แล้ว
2. Run: `npm run dev`
3. เปิด `http://localhost:3000`
4. คลิก **"Continue with Google"**
5. ควรจะเห็นหน้า Google Sign-In page จริง ✅

**หมายเหตุ:** หลังจาก authorize แล้ว Google จะ redirect กล��บมาที่ `/` พร้อม authorization code ใน URL แต่จะยังไม่ทำงานต่อเพราะไม่มี backend รับ code

### ทดสอบแบบครบ (Frontend + Backend)

1. ตั้งค่า `.env` ทั้ง frontend และ backend
2. Run backend: `cd backend-examples && go run .`
3. Run frontend: `npm run dev` (ใน terminal อื่น)
4. เปิด `http://localhost:3000`
5. คลิก **"Continue with Google"**
6. Authorize บน Google
7. ควรจะถูก redirect กลับมาและ login สำเร็จ ✅

---

## 🚀 Deploy to Production

เมื่อ deploy ขึ้น production ต้องเปลี่ยนค่าเหล่านี้:

### 1. Update Google Cloud Console

**Authorized JavaScript origins:**
```
https://your-domain.com
```

**Authorized redirect URIs:**
```
https://your-domain.com/
https://your-domain.com/gmail-callback
https://api.your-domain.com/auth/google/callback
https://api.your-domain.com/gmail/callback/redirect
```

### 2. Update Frontend `.env`

```env
VITE_API_URL=https://api.your-domain.com/api
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### 3. Update Backend `.env`

```env
FRONTEND_URL=https://your-domain.com
GOOGLE_REDIRECT_URL=https://your-domain.com/
GMAIL_REDIRECT_URL=https://your-domain.com/gmail-callback
```

---

## 🎯 OAuth Flow ที่เกิดขึ้น

### ตอนนี้ (มี Client ID แล้ว):

```
User clicks "Continue with Google"
↓
Frontend builds Google OAuth URL
↓
Redirect to: https://accounts.google.com/o/oauth2/v2/auth?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=http://localhost:3000/&
  response_type=code&
  scope=email+profile&
  ...
↓
Google shows Sign-In page 🎉
↓
User authorizes
↓
Google redirects to: http://localhost:3000/?code=xxx
↓
Frontend OR Backend handles code and exchanges for token
```

---

## ❓ Troubleshooting

### ปัญหา: "redirect_uri_mismatch"

**สาเหตุ:** Redirect URI ไม่ตรงกับที่ตั้งใน Google Console

**วิธีแก้:**
1. เช็ค Google Console: **Credentials** > **OAuth 2.0 Client IDs** > คลิก client ของคุณ
2. ดู **Authorized redirect URIs** ว่ามี `http://localhost:3000/` หรือยัง
3. ถ้าไม่มี ให้เพิ่มและ **Save**
4. ลองใหม่อีกครั้ง

### ปัญหา: "Access blocked: This app's request is invalid"

**สาเหตุ:** ยังไม่ได้ตั้งค่า OAuth consent screen

**วิธีแก้:**
1. ไปที่ **OAuth consent screen**
2. เติมข้อมูลให้ครบ
3. เพิ่ม Test users (Gmail ที่จะใช้ทดสอบ)
4. Save และลองใหม่

### ปัญหา: หน้า Google Sign-In แสดง Warning

ถ้าเห็นข้อความ "Google hasn't verified this app" เป็นเรื่องปกติในระหว่าง development:

1. คลิก **"Advanced"**
2. คลิก **"Go to SubTrack (unsafe)"**
3. Continue authorization

ถ้าต้องการเอา warning ออก ต้อง submit app ให้ Google verify (ต้องมี privacy policy และ TOS)

---

## 📚 Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Gmail API Documentation](https://developers.google.com/gmail/api)

---

**เรียบร้อย! ตอนนี้ปุ่ม "Continue with Google" จะทำงานได้แล้ว 🎉**