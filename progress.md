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

### Error and Not-Found Pages (2026-10-05)
- Added a root route error boundary for transient server/network failures, with retry and home recovery actions and no database details exposed to users.
- Added a branded root not-found page for unknown URLs.
- Both use the app's theme tokens and shared button styles. TypeScript, focused ESLint, and `git diff --check` pass. Browser simulation of database outage and unknown-route handling remains to be performed.

### Active Workstream: Laptop Viewport Density Pass (2026-10-05)
- **User-approved scope**: Review and tighten visual density across the full application, including authentication pages, for laptop-sized usable viewports. Process one page/surface at a time and create a separate commit for each completed step.
- **Responsive boundary**: Apply styling only to constrained desktop-width viewports (`min-width: 1024px` and `max-height: 950px`), matching the reported screenshot's short usable height. Preserve mobile and taller desktop presentation; use viewport dimensions rather than device detection. Revisit the threshold if in-browser measurements show the screenshot viewport falls outside it.
- **Behavior boundary**: Visual layout and sizing only. Do not change business logic, data flow, navigation, validation, or interaction behavior.
- **Workflow**: Inventory routes and shared components first; sequence shared shell and auth surfaces alongside management pages without allowing a shared change to unintentionally alter mobile or roomy desktop. For each page step, make the targeted layout change, run the required type and UI checks, review the diff, update this progress section, and commit that step before proceeding.
- **Known examples**: Products page stacks its heading, POS discount setting, four inventory metrics, and table controls before the first rows; POS cart content is clipped/visually crowded at the reported viewport. Treat the cart visibility issue as a page-specific layout concern within the visual-only boundary.
- **Shared foundation**: Add a laptop-only Tailwind spacing-scale reduction in `src/app/globals.css`; this applies across dashboard and auth routes without changing type scale or behavior. Mobile and viewports taller than 950px retain the existing spacing scale.
- **Route sequence**: Admin Dashboard, Products, Categories, Motor Brands, Motorcycles, Services, Users and enrollment verification, Orders, Revenue, Settings, POS; Staff Dashboard, Services, POS, Profile; Member Dashboard and Profile; Login, Register, Verify Email, Set Password; public landing and unauthorized pages. Shared route styling may need no page-local edits; keep each audited page's result in this handoff and commit each page-specific change separately.
- **Admin Products (`/admin/products`)**: Tighten the POS product-discount panel's vertical padding and gap only inside the laptop viewport media query. Product data, discount editing, summary values, and filtering are unchanged. TypeScript passes; detector reports 0 anti-patterns (10 existing advisories); `git diff --check` passes. Committed as `57a0a43`.
- **Admin POS (`/admin/pos`, shared with `/staff/pos`)**: Reduce the fixed payment panel's vertical padding/control heights and quantity-button footprint only in the laptop viewport so the item name and cart list get more room. Cart, payment, and checkout behavior are unchanged. TypeScript passes; detector reports 0 anti-patterns (10 existing advisories); `git diff --check` passes. Commits: `faaea72`, `7220392`.
- **Admin Dashboard (`/admin`)**: Reduce the fixed desktop revenue-chart height from 280px to 220px only in the laptop viewport; metrics and chart data/controls are unchanged. TypeScript passes; detector reports 0 anti-patterns (10 existing advisories); `git diff --check` passes. Committed as `aa287a1`.
- **Admin Categories, Motor Brands, Motorcycles, Services, Users/enrollment verification, Orders, Settings, and profile routes**: Source review confirms these use the shared page layout, spacing utilities, stat cards, and/or docked table controls, so the common laptop spacing rule covers their oversized padding/gaps. No page-local fixed-height override was needed in this pass; interactions and data remain untouched.
- **Admin Revenue (`/admin/revenue`)**: Reduce the fixed report trend-chart height from 288px to 224px only in the laptop viewport. Report data and period controls are unchanged. TypeScript passes; detector reports 0 anti-patterns (10 existing advisories); `git diff --check` passes. Committed as `b339ed1`.
- **Member Profile (`/member/profile`)**: Reduce the decorative profile banner from 144px to 96px only in the laptop viewport. Member data, profile content, and logout behavior are unchanged. TypeScript passes; detector reports 0 anti-patterns (10 existing advisories); `git diff --check` passes. Committed as `b70cfc5`.
- **Staff/Member route review**: Staff service catalog and staff profile inherit the shared laptop spacing; Staff dashboard redirects to POS. Member dashboard redirects to profile. The four auth routes (`/login`, `/register`, `/verify-email`, `/set-password`) share the auth shell and spacing utilities, so they inherit the same laptop-only density rule; no form/OTP behavior or auth copy changed.
- **Public landing and unauthorized routes**: Unauthorized screen inherits the shared density scale. Shorten the public landing hero's vertical padding and desktop heading size only in the laptop viewport; redirects and navigation are unchanged. TypeScript passes; detector reports 0 anti-patterns (10 existing advisories); `git diff --check` passes. Committed as `570e88e`.
- **Verification**: Shared foundation type check passes; UI detector reports 0 anti-patterns and 10 advisory notes in existing files; `git diff --check` passes. Production build is prohibited.
- **Status**: Route review and implementation pass complete. The shared laptop-density rule covers all routes; Products, POS, Dashboard, Revenue, Member Profile, and public landing received additional page-specific sizing. Admin list pages, Settings, profiles, Staff/Member routes, all auth routes, and unauthorized page inherit shared sizing. Each code step passed TypeScript, the UI detector (0 anti-patterns; 10 existing advisories), and `git diff --check`. Browser screenshot QA was unavailable; verify the result at the user's actual viewport when the app is opened.

### Follow-up: Laptop Cards Still Too Large (2026-10-05)
- **User feedback**: The first density pass remained too subtle. The dashboard screenshot shows oversized summary cards still consuming too much of the laptop viewport. Continue with actual card height/type/padding adjustments across shared components, not only utility spacing.
- **Scope remains**: Laptop viewport only (`min-width: 1024px`, `max-height: 950px`); no mobile or taller desktop styling changes and no application logic changes.
- **Shared management step**: Strengthen the laptop spacing scale and compact shared page headers and summary cards. Completed and committed as `2429944` (`style(management): densify laptop summary cards`).
- **Dashboard step**: Compact dashboard metric card padding/value size and Today Operations row spacing, scoped to the laptop media query. TypeScript and `git diff --check` pass. Committed as `1487758` (`style(dashboard): compact laptop metric cards`).
- **Management tables and auth shell step**: Tighten shared table toolbars, inputs, summary rows, table cell padding, and authentication shell vertical padding within the same laptop-only query. This covers category/product/motor/service/user/enrollment/revenue tables and all authentication routes; enrollment, table, and auth behavior are unchanged. TypeScript and `git diff --check` pass. Committed as `1e790ae` (`style(management): compact laptop tables and auth`). The Impeccable CLI is not installed locally and `npx` could not reach the npm registry from the sandbox, so its detector remains unverified for both follow-up steps.
- **Dashboard chart sizing warning**: Remove duplicate mobile/desktop Sales composition pie charts that were mounted into CSS-hidden containers. Keep one ResponsiveContainer per pie in an explicitly sized responsive wrapper, with percentage radii. TypeScript and `git diff --check` pass; commit as a standalone dashboard bug fix.

### A. Global Shell & Surface System (desktop complete; admin mobile refresh planned)
- [x] **`AppShell` & Layout**: Responsive container bounded to `max-w-7xl mx-auto` for management screens to eliminate widescreen voids on 1440p/4K monitors.
- [x] **`AppHeader`**: Compact light/dark adaptive utility bar with role-aware breadcrumbs and theme switch.
- [x] **`AppSidebar`**: Collapsible desktop sidebar with Apple Action Blue active state navigation. The current mobile drawer is the baseline to replace in the admin mobile workstream below.
- [x] **Sidebar Preference Persistence**: Collapse state is stored in a cookie and applied during server rendering so reloads do not flash or reset the sidebar width.
- [x] **Sidebar User Profile Menu**: Account control adapts to expanded/collapsed layouts; its viewport-level menu supports hover, click, keyboard dismissal, and session-revoking logout.
- [x] **Theme Tokens**: Aligned `--primary` to `#0066cc` (light) / `#2997ff` (dark), `--background` to `#f6f8fc` (light) / `#090b13` (dark).

### Active Workstream: Admin Mobile UX (2026-10-04)
- **Scope/order**: Complete the admin experience first. Staff and member mobile navigation/redesign are deferred to a later phase.
- [x] **Phase 1 — Admin shell and sidebar/navigation**: Keep the collapsible sidebar at desktop widths (md and above); on mobile remove the admin header and replace the hamburger/drawer with a fixed, safe-area-aware six-slot bottom tab bar for Dashboard, Products, center POS, Users, More, and Settings. More opens the secondary admin destinations (Categories, Motor Brands, Motorcycles, Services, Orders, Revenue) and account actions. Settings opens a theme control. Preserve nested-route active states, apply top/bottom safe-area spacing, and keep POS checkout controls clear of the tab bar.
- [ ] **Phase 2 — Admin page-by-page mobile redesign**: After the shell is in place, inspect and improve each admin page for mobile use, including Dashboard, Products, Categories, Motor Brands, Motorcycles, Services, Users, Orders, Revenue, and POS. Keep existing desktop behavior and business rules intact while adapting each page's content, controls, tables, and dialogs for small screens.
  - [x] **POS (`/admin/pos`, shared with `/staff/pos`)**: Add a mobile Browse/Order switch with a live item count; adapt search, catalog filters, product/service cards, customer and vehicle selection, cart quantity controls, payment actions, pending orders, and receipt/cancellation dialogs for touch and narrow screens. Preserve the desktop side-by-side catalog and order layout.
  - **POS verification**: `npx tsc --noEmit`, focused ESLint on `src/features/orders/components/pos`, and `git diff --check` pass. ESLint reports one existing `<img>` optimization warning in `PosProductCard.tsx`.
- **Phase 1 verification**: TypeScript and focused ESLint on changed files pass. Repository-wide `npm run lint` reports 18 errors in other files; this shell change adds none. POS cart controls are in normal page flow and remain visible within the padded content area above the persistent bar.
- **Approved interaction choices**: Keep the bar visible while scrolling and keep it visible on POS. Staff center-button behavior and member navigation are outside this admin-first phase.

### Active Workstream: Authentication UX Redesign (2026-10-05)
- **Design references**: GetLayers `Baseline` (precision layout, clear rules, structured surfaces) and `Halden` (quiet typography and minimal chrome), adapted to the existing Apple-inspired design and Action Blue commitment in `DESIGN.md`/`PRODUCT.md`. Do not introduce a new global design system or add WebGL/3D effects to authentication.
- **Visual direction correction (user feedback, 2026-10-05)**: The first pass was too card-based and too generic. It is superseded. Auth forms must not be placed in cards; mobile is a full-page, flat form experience. Desktop uses a spacious split composition with the identity context separated from a directly placed form, not a card-in-a-card shell.
- **Scope**: Desktop and mobile auth experience for `/login`, `/register`, `/verify-email`, and `/set-password`. Preserve all approved enrollment, OTP, login, and password setup business rules. This work is auth-only; do not redesign dashboard surfaces.
- **Page direction**:
  - `/login`: desktop identity panel plus focused sign-in form; mobile single-column form with a compact brand header.
  - `/register`: same shell, with the shop-approved email requirement made clear before submission.
  - `/verify-email`: make the target email and six-digit task prominent, with clear resend timing and recovery.
  - `/set-password`: compact setup form with a useful invalid/expired-link recovery state.
- **Revised implementation order**:
  1. [x] Remove all auth form card wrappers and rebuild the shared desktop split/mobile full-page shell.
  2. [x] Re-compose `/login` and `/register` as direct, left-aligned form surfaces with clear task hierarchy.
  3. [x] Re-compose `/verify-email` and `/set-password` so code/setup tasks and recovery states work naturally in the flat layout.
  4. [x] Review responsive structure and run focused verification. Browser screenshot capture is unavailable in this environment.
- **Preserved behavior from first pass**: login redirects, OTP delivery recovery, password visibility/autofill, verification resend timing, and invalid setup-link recovery remain in place unless this visual pass reveals a specific regression.
- **Verification**: `tsc --noEmit`, focused ESLint, `impeccable detect src --no-advisory` (0 anti-patterns), `git diff --check`, and a route card scan (no card wrappers remain) pass.
- **Status**: Revised no-card direction implemented across all four routes. The earlier card-based implementation was superseded.

#### OTP motion and theme-responsive auth ambience (2026-10-05)
- [x] Added a shared pointer-following Action Blue ambient glow to all customer auth routes; it uses the existing light/dark primary token and runs only for fine pointers when reduced motion is not requested.
- [x] Added a lightweight animated shield, orbit, and lock/check state to customer email verification and admin-assisted enrollment OTP confirmation. Assisted input supports one-time-code autofill and confirms success inline.
- [x] Replaced both plain OTP fields with a shared six-slot animated input. A single accessible native input preserves keyboard editing, paste, numeric mobile keyboards, and OS one-time-code autofill; slot states respond to typing, focus, invalid code, and success.
- [x] Removed the OTP route's enclosing card surface while keeping the admin page shell intact. OTP flow, resend rules, redirects, and action behavior remain unchanged.
- [x] Added a reduced-motion path that removes ambient tracking and decorative loops while preserving verification state feedback.
- **Motion thesis**: orbiting security signal settles into a verified shield/check after a successful code; cursor light follows the visitor as a quiet Action Blue focus cue. CSS only, no canvas/WebGL or added dependency.
- **Verification**: `npx tsc --noEmit`, focused ESLint on changed TS/TSX files, bundled Impeccable detector (0 findings), and `git diff --check` pass. The `npx impeccable` form could not reach npm from the sandbox; used the project's local Impeccable launcher. Browser screenshots are unavailable, so responsive/theme behavior was reviewed from token-driven CSS and route composition.
- **Typography final check (2026-10-05)**: Auth headings retain the system sans hierarchy; supporting prose and form values use 16px for readable mobile entry, labels and utility links remain 14px, OTP digits remain enlarged/tabular, and password hints are raised to 14px. Auth descriptions retain a 42ch measure. Type detector reports no findings.
- **Final validation**: TypeScript passes; repository-wide ESLint completes with 0 errors and 476 existing warnings outside these typography edits; Impeccable type/UI scans and `git diff --check` pass. No test script is configured and production build is prohibited by project rules.

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
     - [x] P1: Finish held-order cancellation audit details. Staff and admins can cancel any pending ticket with confirmation and one of five preset reasons; the authenticated actor and reason are stored through nullable additive fields, and only a still-pending order can be cancelled. Admin order details show the cancellation actor and reason.
     - [x] P2: Revalidate product availability when resuming a held ticket, then cap cart quantities by current stock before checkout. Checkout still rechecks stock transactionally.
     - [x] P2: Add a controlled POS discount flow. Admins manage the global percentage from the Products page; checkout applies it only to product lines on active member orders (never guest orders), with the effective rate and amount shown in receipts and order details. The additive ShopSetting table is synced.
     - [x] P2: Improve POS keyboard and touch operation: F2 scanner focus, 44px control targets, semantic product/service add buttons, and no nested interactive elements.
     - [x] P2: Bound the pending-ticket query to the 50 newest tickets and add search by order number or customer.
     - [x] P2: Add accessible chart-free text alternatives for dashboard and revenue report charts.
   - [x] Polish receipt printing/preview with clearer print layout and table semantics; keep F2 scanner focus from stealing focus while modals are open and restore scanner focus after each successful scan; show loading feedback when resuming tickets and clarify the pending-ticket drawer actions.
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

*Last Updated*: 2026-10-05 (Authentication UX redesign implemented for desktop and mobile; Admin mobile page work remains next)
