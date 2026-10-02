# Project Progress & Agent Handoff: HurngMoto (Moto-Care)

> **Purpose**: This living document tracks the architectural state, completed milestones, active conventions, and upcoming roadmap for HurngMoto. Any autonomous AI agent resuming work on this codebase must read this file first.

---

## 1. Project Overview & Identity

- **Name**: HurngMoto (`Moto-care`)
- **Type**: Professional Motorcycle Workshop & Point-of-Sale (POS) Management System
- **Intended Use**: Real-world motorcycle service shop operations, inventory tracking, POS checkout, customer management, and technician labor logging.
- **Design Standard**: Apple Design Language (`DESIGN.md`, Action Blue `#0066cc` / `#2997ff`) verified with the `impeccable` design suite (0 anti-patterns).

---

## 2. Strict Rules of Engagement

1. **NEVER SEED OR WIPE DATABASE**: The Neon PostgreSQL database contains live/real production records. Never run database migrations that drop data or destructive seed scripts.
2. **DO NOT MODIFY LEGACY DIRECTORIES**: The folders `backend/` and `front-end/` in the parent directory are archived read-only references. All active code lives inside `moto-care-app/`.
3. **MODULARITY STANDARDS**:
   - Components: `< 150` lines (hard ceiling `250` lines). Decompose into sub-components (`*Stats.tsx`, `*Table.tsx`, `*Dialog.tsx`).
   - Services: `< 200` lines (hard ceiling `350` lines).
4. **VERIFICATION BEFORE COMMITTING**:
   - Always run `cmd.exe /c "npx tsc --noEmit"` before declaring a step complete.
   - Run `cmd.exe /c "npx impeccable detect src"` to ensure 0 UI anti-patterns.
   - **Never run production build** (`npm run build`).

---

## 3. Technology Stack & Key Infrastructure

- **Application Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling & Design System**: Tailwind CSS v4, Motion (`motion/react`), Lucide React icons
- **Database & ORM**: PostgreSQL (Neon Serverless) + Prisma ORM
- **Object Storage**: Cloudflare R2 via presigned S3 URLs (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`)
- **Authentication**: JWT (Access & Refresh tokens in HTTP-only cookies), bcrypt password hashing, OTP verification via email
- **Theme Support**: Seamless dual-mode (Apple Light Mode + Apple Obsidian Dark Mode) with no-flash pre-paint hydration script in `layout.tsx`

---

## 4. Current Implementation Status (Vault Synchronized)

### A. Global Shell & Surface System (100% Complete)
- [x] **`AppShell` & Layout**: Responsive container bounded to `max-w-7xl mx-auto` for management screens to eliminate widescreen voids on 1440p/4K monitors.
- [x] **`AppHeader`**: Light/Dark adaptive frosted glass with breadcrumbs, brand identity, mobile toggle, and theme switch.
- [x] **`AppSidebar`**: Collapsible desktop & mobile drawer with Apple Action Blue active state navigation.
- [x] **Sidebar User Profile Dropup**: Hover/tap revealed dropup menu with user info, role badge, and session-revoking Logout button.
- [x] **Theme Tokens**: Aligned `--primary` to `#0066cc` (light) / `#2997ff` (dark), `--background` to `#f6f8fc` (light) / `#090b13` (dark).

### B. Admin Management Modules (100% Complete & Unified)
- [x] **Admin Dashboard (`/admin`)**: Metric cards (Revenue, Orders, Low stock, Members), 7D/30D/90D revenue chart, recent transactions, inventory alerts.
- [x] **Motorcycle Brands (`/admin/motor-brands`)**:
  - `MotorBrandStats`: Total Brands, Active Brands, Models Linked.
  - `DockedTableCard` & `MotorBrandTable`: Monogram avatars, models registered count, status badges, edit/status/delete modals.
- [x] **Motorcycle Models (`/admin/motors`)**:
  - `MotorStats`: Total Models, Active Models, Automatic (CVT) vs. Manual (Clutch) ratio.
  - `MotorTable`: Filter by brand dropdown, transmission tags, status badges, CRUD dialogs.
- [x] **Repair Services (`/admin/services`)**:
  - `ServiceStats`: Total Services, Active Offerings, Average Rate, Premium Service Rate.
  - `ServiceTable`: Formatted currency (THB), scope descriptions, status badges, CRUD dialogs.
- [x] **Product Categories (`/admin/categories`)**:
  - `CategoryStats`: Total Categories, Active Categories, Assigned Products Count.
  - `CategoryTable`: Monogram avatars, assigned products badge, CRUD dialogs.
- [x] **Products & Inventory (`/admin/products`)**:
  - `ProductStats`: Total SKUs, Stock Health %, Low Stock Warning ($\le 5$ units), Inventory Valuation (THB).
  - `ProductTable`: Image thumbnails with R2 fallbacks, sortable columns, category dropdown filter, low stock alerts, R2 presigned image upload flow.
- [x] **User Management (`/admin/users`)**:
  - `UserStats`: Total Accounts, Administrators, Staff Members, Customers.
  - `UserTable`: User avatars, role badges (Admin / Staff / Member), contact details, role promotion/demotion modals.

### C. POS & Core Workflows
- [x] Direct POS checkout with item search & barcode scanning.
- [x] Hold & pending orders workflow.
- [x] Customer/member lookup and vehicle association.
- [x] Cash & QR payment processing (manual verification model).

---

## 5. Known Gaps & Next Priority Tasks (Per Obsidian Vault)

1. **Staff Portal UI Alignment**:
   - Align `/staff/pos` and `/staff/profile` with the unified layout and Apple design language.
   - Enable Staff Services catalog browsing access (per Vault Gap: "Staff Services page access still needs to be made available").
2. **Member / Customer Portal**:
   - Refactor `/member/profile` into an Apple-quality account center with vehicle history and service logs.
   - Implement self-management endpoints (`/users/me` profile update).
3. **POS Terminal Refinements**:
   - Polish receipt printing/preview modal, scanner autofocus behavior, and hold-order drawer.
4. **Automated Testing & Deployment Preparation**:
   - Vitest / Playwright test scaffolding.
   - Verification for Cloudflare Pages (Frontend) + Railway (Backend/Database).

---

## 6. Directory Map of Reusable UI Primitives

```text
src/components/management/
├── ManagementLayout.tsx     # Bounded container (max-w-7xl mx-auto space-y-6)
├── PageHeader.tsx           # Sticky blurred header with count badge & primary CTA
├── QuickStatCard.tsx        # Standard Apple-style operational metric card
├── DockedTableCard.tsx      # Integrated card with search, status tabs, filters & footer
├── StatusBadge.tsx          # Emerald/Slate glowing pill badge
├── RowActions.tsx           # Accessible 3-dots action dropdown
└── ItemDialog.tsx           # Generic single-field item modal
```

*Last Updated*: 2026-10-02 (Admin Redesign & Light/Dark Theme Fix Completed)
