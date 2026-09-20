# ⚡ ApexForge Gym OS — Comprehensive Gym Management & POS

> **Live Demo on GitHub Pages**: [https://doni-wahyudi.github.io/gym_apex/](https://doni-wahyudi.github.io/gym_apex/)

ApexForge is a high-performance, commercial-grade Gym Operating System and Point-of-Sale (POS) designed for modern gym owners, front desk staff, trainers, and athletes. Built with **React 19**, **Vite**, **TypeScript**, and **Supabase**, with responsive design for **Capacitor Android** mobile packaging.

---

## 🌟 Key Features

1. **Executive Command Dashboard**: Real-time facility occupancy counter, peak hourly traffic heatmaps, at-risk member churn radar, and live POS revenue stream.
2. **Access Control Turnstile & Tablet Kiosk**:
   - Camera barcode/QR scanner with Web Audio acoustic verification tone.
   - Fullscreen tablet self-service entrance kiosk with touch numeric keypad and 4-digit staff PIN guard (`1234`).
3. **Gym Pro Shop & POS Register**:
   - Multi-tender transactions (Cash, Debit/Credit Card, QRIS / E-Wallet, Member Account tab).
   - Real-time stock decrementing, discounts, and tax computation.
   - Dual-mode receipts: standard slip & continuous **58mm thermal tape roll** with verification barcode.
   - One-click **WhatsApp digital receipt** dispatch.
   - Cash shift drawer balancing and reconciliation logs.
4. **Member CRM & Digital Passes**: Athlete database, membership expiry alerts, status filters, and digital QR passes.
5. **Fitness & PR Tracker**: SVG body composition tracking charts, personal records (PR) Hall of Fame with confetti celebration, and workout routine planner.
6. **Class Schedule & PT Timetable**: Weekly group studio timetable with live capacity meters and personal trainer roster.
7. **Equipment Manager**: Machinery condition tags (Operational, Needs Service, Out of Order) and scheduled maintenance tickets.
8. **Staff Attendance & PT Commission Ledger**: Clock-in / clock-out shifts and trainer commission splitting calculator.
9. **Member Self-Service Portal**: Active member pass, daily workout split checklist, and 1-click class self-booking.
10. **Bilingual Support (Indonesian Default + English)**: Defaults directly to Bahasa Indonesia with instant one-click toggle to English.
11. **5 Athletic Color Themes**: Cyan Cyber (Default), Emerald Power, Crimson Fury, Solar Amber, and Ultraviolet.

---

## 🚀 Setup & Local Development

### Prerequisites
* Node.js 18+ or 20+
* npm

### Install and Run
```bash
# 1. Clone repository
git clone https://github.com/doni-wahyudi/gym_apex.git
cd gym_apex

# 2. Install dependencies
npm install

# 3. Start local dev server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

---

## ☁️ Supabase Cloud Database Integration

ApexForge is designed offline-first by default with fallback local state, and synchronizes with your live Supabase PostgreSQL database when configured.

### 1. Run Database Schema
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Create or select your project.
3. Open the **SQL Editor** tab.
4. Copy and execute the contents of [`supabase_schema.sql`](./supabase_schema.sql). This will provision all 15 tables, indexes, and Row Level Security policies.

### 2. Configure Repository Secrets for GitHub Pages
To automatically connect your live Supabase database on GitHub Pages:
1. In your GitHub repository (`doni-wahyudi/gym_apex`), navigate to **Settings** → **Secrets and variables** → **Actions**.
2. Click **New repository secret** and add:
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://your-project-id.supabase.co`
3. Click **New repository secret** again and add:
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: `your-supabase-anon-key`
4. The next deployment via GitHub Actions will automatically inject these variables into the production build!

*(You can also configure or override these credentials anytime directly inside the running app via the **Settings (Gear Icon)** modal).*

---

## 📱 Android APK Packaging (Capacitor)

The repository includes a fully configured Capacitor Android project under [`android/`](./android):

```bash
# Build web assets and sync to Android
npm run build
npx cap sync android

# Open project in Android Studio
npm run cap:open

# Or build debug APK directly via command line
npm run android:build
```

The output APK will be generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📄 License
MIT License. Created by [doni-wahyudi](https://github.com/doni-wahyudi).
