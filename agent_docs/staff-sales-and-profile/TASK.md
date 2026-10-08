# ready-for-agent — Staff sales analysis and profile: replace service catalog and enable staff account updates

## Goal

Update the staff panel by replacing the Services page with daily sales analysis for the signed-in staff member and redesigning the staff profile as a professional, responsive account center. Staff must be able to update their own name, phone, email, profile photo, and password.

The user explicitly approved this scope on 2026-10-08. Implement the complete scope end to end while following repository rules and ordinary authorization boundaries.

## Approved scope

### Staff daily sales analysis

- Replace the current `/staff/services` service catalog with a staff sales page and update staff navigation from Services to Sales.
- Show only completed sales attributed to the authenticated staff member (`Order.handledById`). Enforce the owner filter in server-side queries; never rely on client filtering.
- Use completed orders and `completedAt` for the current calendar day in `Asia/Bangkok`. Exclude pending and cancelled orders.
- Present useful daily figures: completed order count, revenue based on `finalTotal`, average order value, payment-method breakdown, product/service sales summary, and a list of that staff member’s completed sales.
- Reuse existing order facts and reporting conventions. Do not invent metrics or expose shop-wide/other-staff totals.

### Staff profile and account security

- Redesign `/staff/profile` into a professional account center that works across phone, tablet, and desktop and follows the existing HurngMoto design system.
- Let the authenticated staff member update first and last name and phone number.
- Let staff change their email through the existing OTP verification pattern, generalized from its current Admin-only use without weakening uniqueness, expiry, cooldown, attempt limits, or session handling.
- Let staff change their profile photo using the existing R2 upload and crop flow.
- Let staff change their password after verifying either their current password or a one-time code sent to their current account email, matching the Admin profile flow. Preserve secure password hashing, OTP expiry/cooldown/attempt limits, session invalidation, and a safe current-session outcome.
- Enforce authenticated STAFF ownership and authorization on every server action. Do not trust client-provided user IDs or role values.
- Update staff navigation so the replacement page is labeled Sales.

## Explicit exclusions

- Do not change `/staff/pos`, `/admin/pos`, shared POS components, checkout, payment, order creation, or POS behavior.
- Do not expose shop-wide or other staff members’ sales analysis.
- Do not change admin or member profile behavior, enrollment rules, or database schema.
- Do not add unrelated staff workflows or features.

## Acceptance conditions

1. `/staff/services` has been replaced by a Sales analysis experience, and staff navigation labels the destination Sales.
2. All sales data is queried for the authenticated staff member and completed orders only; date boundaries use the `Asia/Bangkok` business day.
3. The page shows daily count, revenue, average order, payment breakdown, product/service summary, and recent/current-day completed sales with clear empty and loading/error states as appropriate.
4. Staff can update their own name and phone, change their email using OTP verification, edit their profile photo, and change their password after confirming either their current password or a code sent to their current account email.
5. Server actions enforce role, identity, input validation, uniqueness, and credential rules. Sensitive data is not returned unnecessarily.
6. The redesigned profile remains usable on small phones, tablets, and desktop and supports existing theme tokens.
7. POS code and behavior remain untouched.
8. `npx tsc --noEmit`, focused lint/UI verification, and `git diff --check` pass. Do not run a production build. Do not add or run tests unless requested or required by repository instructions.

## Repository evidence and likely impact areas

- Current Staff Services route: `src/app/(dashboard)/staff/services/page.tsx`.
- Current Staff Profile route: `src/app/(dashboard)/staff/profile/page.tsx`.
- Current Staff Profile presentation: `src/features/users/components/StaffProfile.tsx`.
- Staff navigation: `src/components/app-shell/navigation.config.ts`.
- Existing profile query and Admin profile update/photo helpers: `src/features/users/services/user.service.ts` and `src/features/users/actions/user.actions.ts`.
- Existing R2 upload endpoint and crop UI: `src/app/api/upload/route.ts`, `src/features/users/components/ProfilePhotoCropDialog.tsx`, and profile upload code in `src/features/users/components/AdminProfile.tsx`.
- Existing OTP email-change flow (currently Admin-only): `src/features/users/services/email-change.service.ts` and `src/features/users/actions/email-change.actions.ts`.
- Existing current-password flow (currently Admin-only): `src/features/users/services/admin-password.service.ts` and `src/features/users/actions/admin-password.actions.ts`; validation schemas are in `src/features/auth/schemas.ts`.
- Existing monthly staff aggregation: `src/features/dashboard/services/staff-activity.service.ts` and `src/features/dashboard/components/StaffActivity.tsx`.
- Orders store `handledById`, `completedAt`, `finalTotal`, payment method, and order items. Existing Bangkok date handling appears in `src/features/dashboard/services/dashboard.service.ts` and should be reused or matched.
- Shared dashboard layout and role navigation are in `src/app/(dashboard)/layout.tsx` and `src/components/app-shell/`.
- Project constraints in `AGENTS.md`: no file changes outside requested scope; no database seed/wipe; no production build; required TypeScript and Impeccable verification. `progress.md` is the existing project tracker.

## Ordered implementation steps

1. Add a server-side staff daily sales query with Bangkok-day boundaries and strict authenticated-staff ownership; define a safe display DTO.
2. Build the responsive Sales page and replace the staff Services navigation/route content, including appropriate empty, pending, and error states.
3. Generalize profile name/phone/photo updates for authenticated staff while preserving Admin behavior and existing upload/crop patterns.
4. Generalize the verified email-change flow to staff with the existing OTP security controls and staff-appropriate revalidation/session behavior.
5. Add staff current-password change with secure hashing and session invalidation; leave Admin behavior intact.
6. Redesign and wire the Staff Profile account center across responsive breakpoints and theme modes.
7. Run required verification, review the diff to confirm POS files/behavior are untouched, and update the feature progress tracker with evidence.

## Resolved decisions

- Sales scope: only completed orders credited to the signed-in staff member.
- Password confirmation: offer current-password and current-account-email OTP verification, matching the Admin profile workflow.
- Profile photo: include editing using the existing upload and crop flow.
- Business day: `Asia/Bangkok`.
- POS: explicitly excluded from changes.

## Progress

Implementation has not started. Follow `PROGRESS.md` in this folder and the existing project tracker `progress.md`.
