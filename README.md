# VoiceIt CMS 🎙️

> **AI-powered college complaint management system** — built for students, staff, and administrators.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase)](https://supabase.com)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-purple?logo=clerk)](https://clerk.com)
[![Groq](https://img.shields.io/badge/AI-Groq%20LLaMA-orange)](https://groq.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)

---

## ✨ What is VoiceIt?

VoiceIt is a full-stack complaint management platform designed for colleges and institutions. Students and staff can raise complaints, track their status in real time, and receive AI-assisted responses from administrators — all from any device.

**No more chasing emails. No more standing in queues.**

---

## 🚀 Live Demo

> Deploy your own in 15 minutes → [See Deployment Guide](#-deployment)

---

## 📸 Features

### For Students & Staff
- 📝 **Submit complaints** — choose Student or Staff type, pick a category, attach a photo
- 📊 **Track status** — live timeline: Pending → In Review → Resolved
- 🔔 **Notifications** — unread badge when admin replies
- ⭐ **Rate resolutions** — 1–5 star feedback on resolved complaints
- 🏆 **Achievements** — earn badges for activity (First Voice, Problem Solver, etc.)
- 👤 **Profile** — fill academic/staff details saved to database

### For Administrators
- 🧠 **AI Suggest** — LLaMA 3.1 analyzes complaints and suggests professional replies + auto-categorizes + sets priority
- 📋 **Full complaint dashboard** — filter, sort, bulk-update status
- 💬 **Stage notes** — add internal resolution timeline comments
- 👥 **User management** — view all users, promote to admin/student
- 📈 **Analytics** — complaint trends by category, resolution rates

### App-wide
- 🔐 **Secure auth** — Clerk (sign up, sign in, session management)
- 📱 **Fully responsive** — mobile, tablet, laptop — all screen sizes
- 🎨 **Premium UI** — dark-mode ready, purple gradient theme, glassmorphism
- ⚡ **Fast** — Next.js 16 App Router, Server Components, Turbopack

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, Server Components, Server Actions) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 + Custom Design System |
| **Auth** | Clerk (sign-in, sign-up, webhooks, session) |
| **Database** | Supabase (PostgreSQL + Row Level Security) |
| **Storage** | Supabase Storage (complaint images, profile photos) |
| **AI** | Groq API — LLaMA 3.1 8B Instant |
| **Deployment** | Vercel (frontend + backend) |

---

## 📁 Project Structure

```
voiceit-app/
├── app/
│   ├── (public)/          # Landing page (server, shows user if logged in)
│   ├── (app)/             # Protected app shell (sidebar + mobile nav)
│   │   ├── dashboard/     # Home dashboard (student + admin views)
│   │   ├── complaints/    # New complaint form + detail view
│   │   ├── my-complaints/ # Student complaint list + analytics + badges
│   │   ├── admin/         # Admin complaint panel + user management
│   │   └── settings/      # Profile, photo, student/staff details
│   └── api/
│       ├── ai-analyze/    # Groq LLaMA AI endpoint
│       └── webhooks/clerk/ # Clerk → Supabase user sync
├── actions/               # Server Actions (complaints, users)
├── components/
│   ├── layout/            # Sidebar, MobileTopBar, MobileDrawer, BottomNav
│   ├── complaints/        # StatusBadge, PriorityStars, StarRating, Comments
│   └── student/           # StudentAnalytics, GamificationBadges
├── supabase/
│   └── schema.sql         # Full DB schema (safe to re-run)
└── types/                 # TypeScript interfaces
```

---

## 🗄️ Database Schema

```sql
users          — id, clerk_id, email, name, avatar_url, role, user_type,
                 student_details (JSONB), teacher_details (JSONB)

complaints     — id, user_id, title, description, category, complaint_type,
                 image_url, status, priority, rating, ai_reply, admin_reply, is_read

complaint_comments — id, complaint_id, author_id, stage_label, message, is_admin_note
```

---

## ⚙️ Environment Variables

Create a `.env.local` file:

```env
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...         # Optional — app has auto-fallback

# Clerk Redirects
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Groq AI
GROQ_API_KEY=gsk_...
```

---

## 🚢 Deployment

### Prerequisites
- [Clerk account](https://clerk.com) — for auth
- [Supabase account](https://supabase.com) — for database + storage
- [Groq account](https://console.groq.com) — for AI (free)
- [GitHub account](https://github.com) — for source control
- [Vercel account](https://vercel.com) — for hosting (free)

### Steps

**1. Clone & install**
```bash
git clone https://github.com/YOUR_USERNAME/voiceit.git
cd voiceit/voiceit-app
npm install
```

**2. Set up environment**
```bash
cp .env.example .env.local
# Fill in your keys
```

**3. Run database schema**
- Go to Supabase Dashboard → SQL Editor → paste `supabase/schema.sql` → Run

**4. Run locally**
```bash
npm run dev
```

**5. Deploy to Vercel**
```bash
# Push to GitHub, then import at vercel.com
# Add all env variables in Vercel project settings
```

---

## 📱 Mobile Support

Fully responsive across all screen sizes:

| Feature | Mobile |
|---------|--------|
| Bottom navigation bar | ✅ |
| Slide-in hamburger drawer | ✅ |
| User email + role badge in top bar | ✅ |
| Touch-friendly complaint form | ✅ |
| Camera photo upload | ✅ |
| Status timeline | ✅ |
| Achievement badges | ✅ |
| Admin panel | ✅ |

Breakpoints: `380px` · `640px` · `768px` · `1024px` · `1280px`

---

## 🔒 Security

- All server actions validate auth via Clerk `auth()`
- Admin-only routes check `role === 'admin'` in the database
- Supabase Row Level Security (RLS) enabled on all tables
- Service Role Key only used server-side (never exposed to client)
- File uploads validated by type and size before processing
- Students can only view their own complaints

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'feat: add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — free to use for educational and institutional purposes.

---

## 👤 Author

Built by **Puran Rai**

---

<p align="center">
  <strong>VoiceIt — Every student deserves to be heard.</strong>
</p>
