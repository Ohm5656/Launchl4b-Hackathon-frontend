# 🚀 Quick Start Guide

คุณมี Google OAuth Credentials แล้ว! ทำตามขั้นตอนนี้เพื่อเริ่มใช้งาน

---

## ✅ **Credentials ที่คุณมี:**

- **Client ID:** `734996500317-7begv253jeidg4ufusdnqc4mmlvu2l9m.apps.googleusercontent.com`
- **Client Secret:** `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`
- **Project:** `subtle-proxy-463611-r0`

---

## ⚠️ **ขั้นตอนที่ 1: แก้ไข Redirect URIs ใน Google Console (สำคัญ!)**

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. เลือก Project: **subtle-proxy-463611-r0**
3. ไปที่ **APIs & Services** → **Credentials**
4. คลิกที่ OAuth 2.0 Client ID ของคุณ
5. เลื่อนลงไปหา **Authorized redirect URIs**
6. **เพิ่ม URIs ทั้ง 4 อันนี้:**

```
http://localhost:8080/api/auth/google/callback
http://localhost:8080/api/gmail/callback/redirect
http://localhost:3000/
http://localhost:3000/gmail-callback
```

7. คลิก **SAVE** ✅

**Screenshot ตัวอย่าง:**
```
┌─────────────────────────────────────────────┐
│ Authorized redirect URIs                   │
├─────────────────────────────────────────────┤
│ URIs 1   http://localhost:8080/api/auth... │
│ URIs 2   http://localhost:8080/api/gmail...│
│ URIs 3   http://localhost:3000/            │
│ URIs 4   http://localhost:3000/gmail-call...│
│                                [+ ADD URI]  │
└─────────────────────────────────────────────┘
```

---

## ✅ **ขั้นตอนที่ 2: Enable APIs**

ยังอยู่ใน Google Cloud Console:

1. ไปที่ **APIs & Services** → **Library**
2. ค้นหาและ Enable APIs ต่อไปนี้:

### **Gmail API**
- ค้นหา: `Gmail API`
- คลิก → **ENABLE**

### **Google+ API** (หรือ People API)
- ค้นหา: `Google+ API` หรือ `People API`
- คลิก → **ENABLE**

---

## ✅ **ขั้นตอนที่ 3: OAuth Consent Screen**

1. ไปที่ **OAuth consent screen**
2. ถ้ายังไม่ได้ตั้งค่า:
   - เลือก **External**
   - App name: `SubTrack`
   - User support email: `[อีเมลของคุณ]`
   - Developer email: `[อีเมลของคุณ]`

3. **Scopes** - คลิก "ADD OR REMOVE SCOPES" แล้วเลือก:
   - ✅ `.../auth/userinfo.email`
   - ✅ `.../auth/userinfo.profile`
   - ✅ `.../auth/gmail.readonly`

4. **Test users** - เพิ่มอีเมลที่จะใช้ทดสอบ:
   - เช่น: `isehfs@gmail.com`
   - หรืออีเมลใดก็ได้ที่คุณจะใช้ทดสอบ

5. **SAVE**

---

## ✅ **ขั้นตอนที่ 4: ไฟล์ .env (สร้างให้แล้ว! ✅)**

ผมสร้างไฟล์ `.env` ให้แล้วทั้ง Backend และ Frontend:

### **Backend** (`/backend-examples/.env`)
```env
✅ GOOGLE_CLIENT_ID=734996500317-7begv253jeidg4ufusdnqc4mmlvu2l9m...
✅ GOOGLE_CLIENT_SECRET=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
✅ GMAIL_REDIRECT_URL=http://localhost:8080/api/gmail/callback/redirect
```

### **Frontend** (`/.env`)
```env
✅ VITE_API_URL=http://localhost:8080/api
✅ VITE_GOOGLE_CLIENT_ID=734996500317-7begv253jeidg4ufusdnqc4mmlvu2l9m...
```

---

## 🚀 **ขั้นตอนที่ 5: รันระบบ**

### **Terminal 1: Backend**

```bash
cd backend-examples
go run .
```

**ควรเห็น:**
```
Server starting on port 8080
✓ CORS enabled
✓ Routes registered
✓ Health check: http://localhost:8080/health
```

---

### **Terminal 2: Frontend**

```bash
npm run dev
```

**ควรเห็น:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
```

---

## 🧪 **ขั้นตอนที่ 6: ทดสอบ!**

1. เปิด **http://localhost:3000/app**
2. คลิก **"Add Gmail"**
3. จะเห็นหน้า "Connect Your Gmail"
4. คลิกปุ่ม **"Continue with Google"**
5. → จะไปหน้า Google Sign-In
6. เลือก account (ต้องเป็น Test user ที่เพิ่มไว้)
7. คลิก **"Allow"**
8. → กลับมาหน้า Dashboard
9. จะเห็น Toast: **"Gmail connected!"**
10. รอ 3 วินาที → แสดง subscriptions! 🎉

---

## 🎯 **Checklist**

- [ ] ไปที่ Google Cloud Console
- [ ] เพิ่ม Redirect URIs ทั้ง 4 อัน
- [ ] Enable Gmail API
- [ ] Enable Google+ API (หรือ People API)
- [ ] ตั้งค่า OAuth Consent Screen
- [ ] เพิ่ม Test users
- [ ] เพิ่ม Scopes (email, profile, gmail.readonly)
- [ ] ไฟล์ `.env` ทั้งสองฝั่งสร้างแล้ว ✅
- [ ] รัน Backend: `cd backend-examples && go run .`
- [ ] รัน Frontend: `npm run dev`
- [ ] ทดสอบกดปุ่ม "Continue with Google"

---

## 🐛 **Troubleshooting**

### ปัญหา: "redirect_uri_mismatch"

**สาเหตุ:** Redirect URIs ใน Google Console ไม่ตรง

**วิธีแก้:**
1. เช็คว่าเพิ่ม URIs ครบ 4 อันหรือยัง
2. เช็คว่าไม่มีเว้นวรรค (space) หรือ typo
3. คัดลอกจากด้านบนแล้ววางใหม่

---

### ปัญหา: "access_denied" หรือ "restricted"

**สาเหตุ:** อีเมลที่ใช้ไม่ได้อยู่ใน Test users

**วิธีแก้:**
1. ไปที่ OAuth consent screen
2. เพิ่มอีเมลที่จะใช้ทดสอบใน **Test users**
3. ลองใหม่

---

### ปัญหา: Backend ไม่ทำงาน

**เช็ค:**
```bash
cd backend-examples
cat .env  # ตรวจสอบว่ามีค่า GOOGLE_CLIENT_ID และ GOOGLE_CLIENT_SECRET
go run .  # รันใหม่
```

---

### ปัญหา: Gmail API not enabled

**วิธีแก้:**
1. ไปที่ Google Cloud Console
2. APIs & Services → Library
3. ค้นหา "Gmail API"
4. คลิก ENABLE

---

## 📚 **เอกสารเพิ่มเติม**

- `COMPLETE_SETUP_GUIDE.md` - คู่มือฉบับสมบูรณ์
- `GOOGLE_OAUTH_SETUP.md` - ตั้งค่า Google OAuth แบบละเอียด
- `backend-examples/README.md` - Backend API documentation

---

## ✅ **สรุป**

คุณมี credentials แล้ว! ✅  
ไฟล์ `.env` สร้างให้แล้ว! ✅

**สิ่งที่ต้องทำ:**
1. ✅ เพิ่ม Redirect URIs ใน Google Console (4 อัน)
2. ✅ Enable Gmail API + Google+ API
3. ✅ ตั้งค่า OAuth Consent Screen + Test users
4. ✅ รัน Backend + Frontend
5. ✅ ทดสอบ!

**เมื่อทำครบ → กดปุ่ม "Continue with Google" จะไปหน้า Google Sign-In ได้เลย! 🚀**

---

**หากมีปัญหาหรือข้อสงสัย แจ้งได้เลยครับ! 😊**
