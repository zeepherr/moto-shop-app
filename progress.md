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
- [x] **Admin Dashboard (`/admin`) — operational reporting complete**
  - [x] Baseline: real-data metric cards, recent transactions, inventory alerts, revenue and completed-order drilldowns.
  - [x] Detail reports: `/admin/revenue` supports Today / Week / Month / Year; `/admin/orders` supports operational filters and order details.
  - [x] Revenue terminology correction: the detail report presents costs and estimated profits, including estimated gross margin; service sales are labeled as service revenue rather than labor cost/revenue.
  - [x] Milestone 1: headline revenue and completed-order KPIs use the current Bangkok calendar month and compare with the previous calendar month.
  - [x] Milestone 2: Today’s Operations shows today revenue, completed today, pending orders, cancelled today, and today average order value.
  - [x] Milestone 3: Action Center surfaces pending orders, out-of-stock inventory, low stock, and today’s cancellations with filtered management links.
  - [x] Milestone 4: current-month product/service sales mix and Cash/QR payment overview use completed-order data.
  - [x] Milestone 5: current-month best-selling products and services are ranked by revenue with quantity context.
  - [x] Milestone 6: dashboard Revenue Analytics supports 7D/30D/90D/1Y using a 365-day query window. The revenue detail page supports Today / Week / Month / Year.
  - [x] Milestone 7: Staff Activity reports current-month completed orders, handled revenue, and average order for current staff, grouped by the recorded order handler.
  - [x] Validation: TypeScript, targeted ESLint, `impeccable detect src` (0 anti-patterns), and `git diff --check`.
  - **Data boundaries**: do not display exact labor cost, historical product COGS, appointments, suppliers, stock movement, configurable reorder points, or real shop-open state until those facts are recorded in the schema.
  - **Reporting boundary**: staff activity only uses completed orders with a recorded handler and includes users whose current role is Staff.
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
- [x] **User Management (`/admin/users`) — professional operational redesign complete**:
  - **Preserved rules**: registration remains Admin-controlled; the Admin enters only an email and chooses Member or Staff; no Admin enrollment; Admin never sets or sees a password; customers enrich their profile after activation.
  - **Method 1 — self-registration approval**: Admin sends the generic `/register` link after granting a one-day approval. The customer supplies a password, verifies a 10-minute OTP, and becomes active.
  - **Method 2 — counter-assisted registration**: Admin sends the customer a 10-minute OTP, verifies the code on the dedicated Admin page, then the system sends a single-use one-day password-setup link plus `/login` link.
  - **Information architecture/UI**: People workspace and action-first Enrollment queue. Surface records needing attention (OTP verification, password setup pending, expiry, delivery failures). Provide desktop data tables, responsive mobile cards, and viewport-aware action menus.
  - **People records**: show role, access state, verified contact, profile completion, last sign-in, and contextual actions. Add an account detail surface for role/access changes, enrollment history, profile state, and activity.
  - **Enrollment records**: show method, current task, expiry, delivery result/resend history, and direct actions: verify OTP, resend the correct email, cancel, or explicitly restart.
  - **Required logic hardening**:
    - Add a self-service registration-link resend path; today an email-delivery failure can leave an approved enrollment without a clear recovery action.
    - Do not silently overwrite an unfinished enrollment for the same email. Show the existing flow and require the Admin to choose resume/resend, cancel, or restart.
    - Make OTP verification and password-link consumption atomic to prevent duplicate submissions or inconsistent accounts.
    - Use an explicit lifecycle model for enrollment task state and separately record delivery attempts/failures.
    - Add an audit trail for enrollment creation, resend attempts, OTP verification, password setup, role changes, deactivation, and reactivation.
    - Add deactivate/reactivate as the normal access-control action; retain user, vehicle, and order history. Deactivation and role changes must revoke active sessions and protect subsequent server actions immediately.
  - **Confirmed product decisions (2026-10-04)**:
    - Retain a complete audit history for User Management actions.
    - Deactivated users stay in the system and can be reactivated.
    - Existing unfinished enrollments must be shown and require an explicit Admin decision to resume/resend, cancel, or restart.
  - **Implementation order**:
    1. [x] Product context, enrollment lifecycle, additive audit schema, and server-side invariants. `UserAuditEvent` is deployed through additive `prisma db push`; create/retry/cancel/completion events and role/access changes are recorded. Enrollment creation no longer silently overwrites an unfinished flow, OTP/password completion uses an atomic status claim, and role/access changes revoke refresh sessions.
    2. [x] Redesigned People/enrollment workspace: action-first queue, explicit resend/cancel/restart choices, account role/access controls, profile state, recent sign-in data, and a protected audit-backed account detail dialog. Desktop tables remain dense; mobile uses account/enrollment cards with the shared viewport-aware action menu.
    3. [x] Final verification passed: TypeScript, focused ESLint, Prisma validation, `impeccable detect src`, and `git diff --check`. No production build was run.

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
   - **POS hardening review, 2026-10-03 — do before visual expansion**:
     - [x] P0: Restrict every POS server action to ADMIN or STAFF. Route middleware is not sufficient protection for direct server-action calls.
     - [x] P0: Resume, update, and checkout operations must require the target order to still be PENDING, using an atomic status-aware update. The current ID-only updates can modify a completed order after a stale or malicious resume request.
     - [x] P0: Replace the full member include in order retrieval with an explicit safe selection, and build a DTO without spreading the Prisma record. The current serializer can expose member fields that the POS does not need.
     - [x] P1: Add vehicle selection after a member is chosen. The POS carries the selected registered motorcycle through held orders and checkout, with server-side ownership validation.
     - [x] P1: Add cashier QR payment confirmation and a printable completed-sale receipt. Checkout now requires an explicit payment-received confirmation when QR is selected.
     - [ ] P1: Add confirmation and a reason for cancelling held orders, plus ownership or concurrency protection for pending tickets used by multiple staff.
     - [x] P2: Revalidate product availability when resuming a held ticket, then cap cart quantities by current stock before checkout. Checkout still rechecks stock transactionally.
     - [ ] P2: Add discounts only with an approved role/approval rule; discount fields already exist in the schema but the POS has no controlled discount flow.
     - [x] P2: Improve POS keyboard and touch operation: F2 scanner focus, 44px control targets, semantic product/service add buttons, and no nested interactive elements.
     - [x] P2: Bound the pending-ticket query to the 50 newest tickets and add search by order number or customer.
     - [ ] P2: Add accessible chart-free text alternatives where required.
   - Polish receipt printing/preview modal, scanner autofocus behavior, and hold-order drawer after the hardening items above.
3. **Automated Testing & Deployment Preparation**:
   - Vitest / Playwright test scaffolding.
   - Verification for Cloudflare Pages (Frontend) + Railway (Backend/Database).

### Completed User Management Handoff (2026-10-04)

- **Status**: User Management redesign is implemented and committed. A follow-up responsive pass adds mobile People and Enrollment cards; the original table layouts remain for desktop.
- **Approved enrollment rules**:
  - Every Member or Staff registration begins with an Admin at the shop. Admin accounts are excluded from enrollment creation.
  - Method 1 has no signed invitation URL: Admin grants one-day email approval; the customer uses `/register`, creates their password, then completes email OTP verification.
  - Method 2 has the customer disclose their emailed OTP to an Admin. Only a correct OTP triggers the one-day, single-use password-setup link; Admin never sets or sees the password.
  - Profile enrichment is deferred to the customer's profile after activation.
- **Execution rule**: work in small phases, mark a phase complete only after focused verification, run the complete relevant checks before committing, then commit the finished feature.
- **Validation for enrollment redesign**: Prisma format/generate, additive `prisma db push`, TypeScript, focused ESLint, `prisma validate`, `impeccable detect src`, and `git diff --check` passed. No production build was run.
- **Primary files**:
  - `src/app/(dashboard)/admin/page.tsx`
  - `src/features/dashboard/services/dashboard.service.ts`
  - `src/features/dashboard/components/RevenueTrendChart.tsx`
  - new dashboard components should stay under `src/features/dashboard/components/`.
- **Existing detail routes**: `/admin/revenue`, `/admin/orders`, `/admin/products`, `/admin/users`, `/admin/pos`.
- **Time zone/business reporting boundary**: calculate calendar-day and calendar-month ranges in `Asia/Bangkok`.
- **Last committed baseline before the responsive follow-up**: `5f8ef54` (`feat(users): redesign people management workflows`).
- **Implementation state**: Dashboard milestones 1–6, controlled enrollment, and the redesigned User Management workflow are complete. Remaining unchecked dashboard and POS items are listed above as separate work.
- **Verified hydration note**: `cz-shortcut-listen` is injected onto `<body>` by a browser extension before React hydrates. Root layout suppresses hydration warnings on both `<html>` and `<body>`; this does not mask application content mismatches below those elements.
- **POS boundary fix**: Pending-order server actions serialize Prisma Decimal fields before returning data to client components. Checkout and hold actions return success state only because their Prisma records are unused by the client. TypeScript and focused ESLint passed.

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

*Last Updated*: 2026-10-04 (User Management complete; POS P1 vehicle/QR work and staff activity dashboard added)
