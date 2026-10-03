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
- [x] **`AppHeader`**: Compact light/dark adaptive utility bar with role-aware breadcrumbs, mobile navigation, and theme switch.
- [x] **`AppSidebar`**: Collapsible desktop & mobile drawer with Apple Action Blue active state navigation.
- [x] **Sidebar Preference Persistence**: Collapse state is stored in a cookie and applied during server rendering so reloads do not flash or reset the sidebar width.
- [x] **Sidebar User Profile Menu**: Account control adapts to expanded/collapsed layouts; its viewport-level menu supports hover, click, keyboard dismissal, and session-revoking logout.
- [x] **Theme Tokens**: Aligned `--primary` to `#0066cc` (light) / `#2997ff` (dark), `--background` to `#f6f8fc` (light) / `#090b13` (dark).

### B. Admin Management Modules
- [ ] **Admin Dashboard (`/admin`) — operational expansion in progress**
  - [x] Baseline: real-data metric cards, recent transactions, inventory alerts, revenue and completed-order drilldowns.
  - [x] Detail reports: `/admin/revenue` supports Today / Week / Month / Year; `/admin/orders` supports operational filters and order details.
  - [x] Milestone 1: headline revenue and completed-order KPIs use the current Bangkok calendar month and compare with the previous calendar month.
  - [x] Milestone 2: Today’s Operations shows today revenue, completed today, pending orders, cancelled today, and today average order value.
  - [x] Milestone 3: Action Center surfaces pending orders, out-of-stock inventory, low stock, and today’s cancellations with filtered management links.
  - [x] Milestone 4: current-month product/service sales mix and Cash/QR payment overview use completed-order data.
  - [x] Milestone 5: current-month best-selling products and services are ranked by revenue with quantity context.
  - [x] Milestone 6: dashboard Revenue Analytics supports 7D/30D/90D/1Y using a 365-day query window. The revenue detail page supports Today / Week / Month / Year.
  - [x] Validation: TypeScript, targeted ESLint, `impeccable detect src` (0 anti-patterns), and `git diff --check`.
  - **Data boundaries**: do not display exact labor cost, historical product COGS, appointments, suppliers, stock movement, configurable reorder points, or real shop-open state until those facts are recorded in the schema.
  - **Deferred**: staff activity analytics (orders, handled revenue, average order) can follow after the operational dashboard milestones above.
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

### D. Staff Portal (100% Complete & Unified)
- [x] **Staff POS (`/staff/pos`)**: Shares the production POS workspace and active catalog data with the admin terminal.
- [x] **Staff Services (`/staff/services`)**: Read-only searchable catalog of active workshop services and standard rates.
- [x] **Staff Profile (`/staff/profile`)**: Role-appropriate account center for staff identity, contact details, and access status.

---

## 5. Known Gaps & Next Priority Tasks (Per Obsidian Vault)

1. **Member / Customer Portal**:
   - Refactor `/member/profile` into an Apple-quality account center with vehicle history and service logs.
   - Implement self-management endpoints (`/users/me` profile update).
2. **POS Terminal Refinements**:
   - Polish receipt printing/preview modal, scanner autofocus behavior, and hold-order drawer.
3. **Automated Testing & Deployment Preparation**:
   - Vitest / Playwright test scaffolding.
   - Verification for Cloudflare Pages (Frontend) + Railway (Backend/Database).

### Active Work Handoff (2026-10-03)

- **Current objective**: complete the Admin Dashboard operational expansion listed in section 4B.
- **Resume order**: continue from the first unchecked dashboard milestone, update its checkbox immediately after implementation and focused verification, then move to the next milestone.
- **Primary files**:
  - `src/app/(dashboard)/admin/page.tsx`
  - `src/features/dashboard/services/dashboard.service.ts`
  - `src/features/dashboard/components/RevenueTrendChart.tsx`
  - new dashboard components should stay under `src/features/dashboard/components/`.
- **Existing detail routes**: `/admin/revenue`, `/admin/orders`, `/admin/products`, `/admin/users`, `/admin/pos`.
- **Time zone/business reporting boundary**: calculate calendar-day and calendar-month ranges in `Asia/Bangkok`.
- **Last committed baseline**: `ad80f15 feat(admin): add dashboard reporting drilldowns`.
- **Implementation state**: milestones 1–6 complete and required validation passed. Changes are uncommitted.

---

## 6. Directory Map of Reusable UI Primitives

```text
src/components/management/
├── ManagementLayout.tsx     # Bounded container (max-w-7xl mx-auto space-y-6)
├── PageHeader.tsx           # Structured page heading with count badge & primary CTA
├── QuickStatCard.tsx        # Standard Apple-style operational metric card
├── DockedTableCard.tsx      # Integrated card with search, status tabs, filters & footer
├── StatusBadge.tsx          # Emerald/Slate glowing pill badge
├── RowActions.tsx           # Accessible, viewport-aware action menu
├── ActionMenu.tsx           # Shared portal action menu (positioning, keyboard, tones)
└── ItemDialog.tsx           # Generic single-field item modal
```

*Last Updated*: 2026-10-03 (Unified ActionMenu primitive & server-action error hardening)
