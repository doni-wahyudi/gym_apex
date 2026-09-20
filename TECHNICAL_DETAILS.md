# Project Technical Details — ApexForge Gym Operating System (Web & Android-Ready)

ApexForge is an all-in-one Gym Management and Point-of-Sale (POS) System built with React, Vite, TypeScript, and Supabase, engineered with mobile-first responsiveness for seamless Capacitor Android APK wrapping.

---

## 1. System Overview & Tech Stack
* **Framework & Bundler**: React 19 / Vite 6 / TypeScript (`verbatimModuleSyntax: true`).
* **Database & BaaS**: Supabase PostgreSQL ([supabase_schema.sql](file:///c:/Users/whydo/D9043DB2025/code/explore/web_project/web_gym_manage/supabase_schema.sql)) with 15 tables and Row Level Security (RLS) policies.
* **Hybrid Data Store**: [gymStore.ts](file:///c:/Users/whydo/D9043DB2025/code/explore/web_project/web_gym_manage/src/services/gymStore.ts) provides reactive, persistent offline-first state pre-seeded with rich gym data, synchronizing with Supabase when credentials are provided in settings.
* **Styling Strategy**: Native CSS design system in [src/index.css](file:///c:/Users/whydo/D9043DB2025/code/explore/web_project/web_gym_manage/src/index.css) adhering strictly to `ui-ux-pro-design` (6-state lifecycle on buttons, L0–L3 surface physics, high contrast typography with Google Fonts *Outfit*, *Inter*, and *JetBrains Mono*).
* **Bilingual Support (ID Default / EN Toggle)**: [src/services/i18n.tsx](file:///c:/Users/whydo/D9043DB2025/code/explore/web_project/web_gym_manage/src/services/i18n.tsx) — Full Indonesian default dictionary with 1-click English toggle, backed by React Context (`LanguageProvider`) and `localStorage` persistence across all modules and subcomponents.
* **5 Athletic Color Themes**: [src/services/theme.tsx](file:///c:/Users/whydo/D9043DB2025/code/explore/web_project/web_gym_manage/src/services/theme.tsx) & [src/index.css](file:///c:/Users/whydo/D9043DB2025/code/explore/web_project/web_gym_manage/src/index.css) — 1. Cyan Cyber (`#06b6d4`, default), 2. Emerald Power (`#10b981`), 3. Crimson Fury (`#f43f5e`), 4. Solar Amber (`#f59e0b`), 5. Ultraviolet (`#a855f7`). Propagates dynamically via `[data-theme]` CSS variables to `.btn-primary`, focus rings, glowing indicators, and SVG chart curves.
* **Iconography & Effects**: `lucide-react`, `canvas-confetti` (for PR celebrations).
* **Mobile & Capacitor Ready**: Safe-area CSS variables (`env(safe-area-inset-top)` / `bottom`), touch hitboxes (>=44px), viewport meta tags (`viewport-fit=cover`), and adaptive bottom navigation bar.

---

## 2. Active Routing, Roles & Navigation
All modules are managed through the reactive application router in [App.tsx](file:///c:/Users/whydo/D9043DB2025/code/explore/web_project/web_gym_manage/src/App.tsx) and framed by [AppLayout.tsx](file:///c:/Users/whydo/D9043DB2025/code/explore/web_project/web_gym_manage/src/components/layout/AppLayout.tsx):

### Role-Based Access Control (RBAC)
The application includes a role simulation switcher with tailored navigation scopes:
* **`owner` (Marcus Vance - Gym Owner / Admin)**: Unrestricted access to all modules, financial metrics, and staff management.
* **`front_desk` (Sarah Jenkins - Front Desk Officer)**: Scoped to Turnstile Check-In, POS Register, Member CRM, and Schedule.
* **`trainer` (Coach Tyson - Head Coach)**: Scoped to Classes & Schedule and Fitness & PR Tracker.
* **`member` (Alex Wright - Active Member)**: Scoped to Member Self-Service Portal.

### Application Modules
1. **Executive Dashboard (`dashboard`)**: [ExecutiveDashboard.tsx](file:///c:/Users/whydo/D9043DB2025/code/explore/web_project/web_gym_manage/src/components/dashboard/ExecutiveDashboard.tsx) — Real-time KPIs, occupancy meter, peak hours traffic heatmap, at-risk churn radar, activity feeds.
2. **Access & Front Desk Check-In (`checkin`)**: [CheckInKiosk.tsx](file:///c:/Users/whydo/D9043DB2025/code/explore/web_project/web_gym_manage/src/components/checkin/CheckInKiosk.tsx)
   - **Live Camera Scanner**: [CameraScannerModal.tsx](file:///c:/Users/whydo/D9043DB2025/code/explore/web_project/web_gym_manage/src/components/checkin/CameraScannerModal.tsx) — Real-time camera feed with target reticle and Web Audio API beep synthesizer.
   - **Tablet Kiosk Lockdown**: [KioskLockdownView.tsx](file:///c:/Users/whydo/D9043DB2025/code/explore/web_project/web_gym_manage/src/components/checkin/KioskLockdownView.tsx) — Fullscreen entrance kiosk for tablets with touch numeric keypad, instant card scan, and 4-digit staff PIN guard (`1234`).
3. **POS Register (`pos`)**: [PosRegister.tsx](file:///c:/Users/whydo/D9043DB2025/code/explore/web_project/web_gym_manage/src/components/pos/PosRegister.tsx)
   - **58mm Thermal Tape & Digital Receipt**: [ReceiptModal.tsx](file:///c:/Users/whydo/D9043DB2025/code/explore/web_project/web_gym_manage/src/components/pos/ReceiptModal.tsx) — Dual toggle between standard invoice and authentic continuous 58mm thermal receipt roll with barcode and QR verification.
   - **WhatsApp Invoice Dispatch**: [whatsappService.ts](file:///c:/Users/whydo/D9043DB2025/code/explore/web_project/web_gym_manage/src/services/whatsappService.ts) — One-click WhatsApp invoice dispatch with formatted currency and line items.
   - **Cash Shift Balancing**: [CashShiftModal.tsx](file:///c:/Users/whydo/D9043DB2025/code/explore/web_project/web_gym_manage/src/components/pos/CashShiftModal.tsx) — Opening float, tender tracking, and end-of-shift reconciliation.
4. **Members CRM (`members`)**: [MemberDirectory.tsx](file:///c:/Users/whydo/D9043DB2025/code/explore/web_project/web_gym_manage/src/components/members/MemberDirectory.tsx), [MemberDetailModal.tsx](file:///c:/Users/whydo/D9043DB2025/code/explore/web_project/web_gym_manage/src/components/members/MemberDetailModal.tsx), [AddMemberModal.tsx](file:///c:/Users/whydo/D9043DB2025/code/explore/web_project/web_gym_manage/src/components/members/AddMemberModal.tsx) — Member search, status tabs, retention warnings, digital QR pass, attendance logs, and renewal actions.
5. **Fitness Tracker (`fitness`)**: [ProgressTracker.tsx](file:///c:/Users/whydo/D9043DB2025/code/explore/web_project/web_gym_manage/src/components/fitness/ProgressTracker.tsx) — Body weight/fat composition trends with SVG charts, PR Hall of Fame with confetti celebration, workout routine builder.
6. **Classes & Schedule (`schedule`)**: [ClassScheduleView.tsx](file:///c:/Users/whydo/D9043DB2025/code/explore/web_project/web_gym_manage/src/components/schedule/ClassScheduleView.tsx) — Weekly group timetable, capacity meters, personal trainer roster.
7. **Equipment Manager (`equipment`)**: [EquipmentManager.tsx](file:///c:/Users/whydo/D9043DB2025/code/explore/web_project/web_gym_manage/src/components/equipment/EquipmentManager.tsx) — Gym machinery inventory, operational condition tags, maintenance logging.
8. **Member Self-Service App Portal (`portal`)**: [MemberPortalView.tsx](file:///c:/Users/whydo/D9043DB2025/code/explore/web_project/web_gym_manage/src/components/portal/MemberPortalView.tsx) — Digital gym pass with barcode/QR code, workout checklist with set completion checkmarks, 1-click group class self-booking, personal records view, and body weight logger.
9. **Staff Attendance & Payroll Modal**: [StaffAttendanceModal.tsx](file:///c:/Users/whydo/D9043DB2025/code/explore/web_project/web_gym_manage/src/components/staff/StaffAttendanceModal.tsx) — Live shift clock-in/clock-out, shift log history, and personal trainer commission ledger calculator (gross revenue vs gym profit vs trainer payout).
10. **Settings, Language & Theme Picker**: [SettingsModal.tsx](file:///c:/Users/whydo/D9043DB2025/code/explore/web_project/web_gym_manage/src/components/settings/SettingsModal.tsx) — Live Supabase connection URL & Anon Key config, 5 athletic color theme cards, bilingual language switch (🇮🇩 ID / 🇬🇧 EN), database schema setup, and local data export/reset.

---

## 3. Capacitor Native Android Integration
ApexForge is packaged as a high-performance native Android application using Capacitor:
* **App ID**: `com.apexforge.gym`
* **App Name**: `ApexForge Gym OS`
* **Web Directory**: `dist`
* **Android Project Path**: [android/](file:///c:/Users/whydo/D9043DB2025/code/explore/web_project/web_gym_manage/android)
* **Built APK Artifact**: `android/app/build/outputs/apk/debug/app-debug.apk` (4.33 MB)
* **Gradle Build Command**:
  ```powershell
  # Sync web bundle to Android and compile debug APK
  npm run android:build
  ```
* **Open in Android Studio**:
  ```powershell
  npm run cap:open
  ```

---

## 4. Key Configurations & Restorations
* **Database Schema Script**: [supabase_schema.sql](file:///c:/Users/whydo/D9043DB2025/code/explore/web_project/web_gym_manage/supabase_schema.sql) provisioned with complete PostgreSQL schema for 15 tables, indexes, and RLS.
* **Capacitor Configuration**: [capacitor.config.ts](file:///c:/Users/whydo/D9043DB2025/code/explore/web_project/web_gym_manage/capacitor.config.ts) configured for full-bleed dark theme and HTTPS local origin.
* **Responsive Breakpoints**: Configured in `src/index.css` to switch seamlessly between desktop collapsible sidebar and mobile bottom navigation bar at 768px.
* **Type-Safe Imports**: Standardized across the entire codebase to comply with `verbatimModuleSyntax: true` and `noUnusedLocals: true`.

---

## 5. Guidelines for Future Chats & Agents
* Adhere strictly to `preferences.md`: Do NOT perform preemptive git commits or pushes without explicit user instruction.
* Maintain pre-defined CSS variables in `src/index.css`; avoid hardcoded hex codes or ad-hoc utility classes.
* Keep `TECHNICAL_DETAILS.md` synchronized in subsequent chats.

---

## 6. Verification Pipeline & Smoke Tests
* **Type Safety & Production Build**:
  ```powershell
  npm run build
  ```
  *(Verified: 0 errors, 1944 modules transformed, built in <600ms)*.
* **Dev Server**:
  ```powershell
  npm run dev
  ```
  *(Running on http://localhost:5173/)*.
* **Android APK Build**:
  ```powershell
  cd android; .\gradlew.bat assembleDebug
  ```
  *(Verified: BUILD SUCCESSFUL, generated `app-debug.apk`)*.
* **End-to-End Verification**: Full browser workflow verified via subagent across all modules including staff attendance, member portal, camera scan, tablet kiosk lockdown, and 58mm thermal receipts.
