# 💎 SubTrack - AI-Powered Subscription Tracker

<div align="center">

![SubTrack](https://img.shields.io/badge/SubTrack-AI--Powered-6366f1?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?style=for-the-badge&logo=tailwindcss)
![Go](https://img.shields.io/badge/Go-1.21-00add8?style=for-the-badge&logo=go)

**Modern fintech-style subscription tracker with automatic Gmail scanning**

[Quick Start](#-quick-start) • [Features](#-features) • [Documentation](#-documentation) • [Demo](#-demo)

</div>

---

##  Overview

SubTrack automatically tracks all your subscriptions by scanning Gmail for receipts and invoices. Built with a beautiful, modern fintech design using soft indigo/blue color palette.

###  Key Features

-  **Google OAuth Integration** - Secure sign-in with Google
-  **Gmail Auto-Scan** - AI detects subscription receipts automatically
-  **Dashboard** - Beautiful overview of monthly spending
-  **Calendar View** - Visualize payment dates
-  **Insights** - AI-powered spending analysis
-  **Modern Design** - Fintech-inspired UI with smooth animations

---

##  Quick Start

### Option 1: Demo Mode (No Setup Required)

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and sign in with any email/password!

### Option 2: With Google OAuth (Recommended)

1. **Setup Google OAuth** (5 minutes)
   - Follow [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)
   - Get your Google Client ID

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your VITE_GOOGLE_CLIENT_ID
   ```

3. **Run**
   ```bash
   npm install
   npm run dev
   ```

Now "Continue with Google" and "Add Gmail" buttons will work! 🎉

### Option 3: Full Stack (Frontend + Backend)

See [QUICK_START.md](./QUICK_START.md) for complete setup with Go backend.

---

##  Screenshots

### Login Page
- Blurred dashboard background
- Google Sign-In integration
- Modern card design

### Dashboard
- Monthly spending overview
- Upcoming payments
- Subscription list with categories

### Add Gmail Flow
- Step-by-step authorization
- Beautiful loading states
- Privacy-focused messaging

### Calendar View
- Monthly calendar with payment markers
- Visual spending indicators

### Insights Page
- Spending trends chart
- Category breakdown
- AI recommendations

---

##  Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS v4** for styling
- **Motion** (Framer Motion) for animations
- **Recharts** for data visualization
- **Lucide React** for icons

### Backend (Optional)
- **Go 1.21+** 
- **Gmail API** integration
- **JWT** authentication
- **OpenAI API** for AI scanning (planned)

---

##  Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get started in 3 ways
- **[GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)** - Detailed OAuth setup guide
- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Technical integration details
- **[backend-examples/README.md](./backend-examples/README.md)** - Go backend documentation

---

##  Features in Detail

### 1. Google Sign-In
- OAuth 2.0 authentication
- Automatic token management
- Secure session handling

### 2. Gmail Integration
- Read-only Gmail access
- Automatic receipt detection
- Privacy-first approach

### 3. Dashboard
- Real-time spending overview
- Upcoming payment alerts
- Quick actions

### 4. Calendar View
- Monthly view with payments
- Visual spending indicators
- Click to see details

### 5. Insights & Analytics
- Spending trends over time
- Category-wise breakdown
- AI-powered recommendations

### 6. Settings
- Manage connected accounts
- Disconnect Gmail anytime
- Privacy controls

---

##  Security & Privacy

-  **Read-only** Gmail access
-  **No email modification** - we only read
-  **Encrypted** data storage
-  **OAuth 2.0** authentication
-  **Disconnect anytime** from settings

> **Note:** SubTrack is designed for personal use and demos. Not intended for collecting PII or securing highly sensitive data.

---

## Environment Variables

### Frontend (`.env`)
```env
# Backend API URL (optional)
VITE_API_URL=http://localhost:8080/api

# Google OAuth Client ID (required for OAuth features)
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### Backend (`backend-examples/.env`)
```env
PORT=8080
FRONTEND_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URL=http://localhost:3000/
GMAIL_REDIRECT_URL=http://localhost:3000/gmail-callback

JWT_SECRET=your-random-secret-key
```

---

##  Project Structure

```
subtrack/
├── src/
│   ├── app/
│   │   ├── components/        # React components
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── AddGmail.tsx
│   │   │   └── ...
│   │   ├── pages/             # Route pages
│   │   ├── services/          # API services
│   │   └── routes.ts          # Router configuration
│   └── styles/
│       └── theme.css          # Design tokens
├── backend-examples/          # Go backend
│   ├── main.go
│   ├── auth_service.go
│   ├── gmail_service.go
│   └── ...
├── .env.example              # Environment template
└── docs/                     # Documentation
```

---

##  Roadmap

- [x] Google OAuth integration
- [x] Gmail connection flow
- [x] Dashboard UI
- [x] Calendar view
- [x] Insights page
- [ ] AI email scanning (OpenAI integration)
- [ ] Database persistence (PostgreSQL)
- [ ] Email notifications
- [ ] Multi-currency support
- [ ] Export to CSV/PDF
- [ ] Mobile app (React Native)

---

##  Contributing

This is a demo project for showcasing modern web development practices. Feel free to fork and customize for your needs!

---

## 📝 License

MIT License - feel free to use this project for learning and development.

---

##  FAQ

### Q: Do I need a backend to use this?
**A:** No! The app works in demo mode without a backend. You need backend only for actual Gmail scanning.

### Q: Is my Gmail data safe?
**A:** Yes! We use read-only access and follow Google's OAuth best practices. You can disconnect anytime.

### Q: Can I use this in production?
**A:** This is designed as a demo/personal project. For production use, add proper database, error handling, and security measures.

### Q: Why isn't Gmail scanning working?
**A:** Make sure you:
1. Set up Google OAuth credentials
2. Added `VITE_GOOGLE_CLIENT_ID` to `.env`
3. Started the Go backend (for actual scanning)

### Q: How do I get Google OAuth credentials?
**A:** Follow the detailed guide in [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)

---

##  Demo

Try the demo: `npm run dev` and visit `http://localhost:3000`

**Demo Credentials:** Any email/password works in demo mode!

---



<div align="center">

**Made with ❤️ using React, TypeScript, and Tailwind CSS**

[⬆ Back to Top](#-subtrack---ai-powered-subscription-tracker)

</div>
