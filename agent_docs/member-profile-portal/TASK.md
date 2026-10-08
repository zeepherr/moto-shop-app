# Ready for Agent — Member Profile Portal

## Goal

Redesign `/member/profile` as a responsive, single-page member account center. Members can manage personal information and account security, register motorcycles, review motorcycle catalog submissions, and view their own order history. Admins review suggested motorcycles before they enter the shared catalog; staff can read member motorcycle details while working with the customer.

## Approved scope

- Preserve HurngMoto’s documented Apple-inspired design system and action-blue interaction language.
- Remove the shared sidebar and mobile navigation from the member experience. Keep theme switching and logout on the member page.
- Let a member update first name, last name, phone, and email. Email changes require OTP verification.
- Let a member change their password using either the current password or an OTP sent to their current account email.
- Show all orders linked to the authenticated member with customer-safe status, dates, items, and totals. Count completed orders only as visits and completed spending.
- Let a member search the active motorcycle catalog and register a catalog motorcycle to their account. License plate is optional.
- If no catalog motorcycle matches, let the member submit brand, model, transmission type, and optional plate for admin review. Approval creates/reuses the catalog entry and adds the submitted motorcycle to that member’s garage. Show the member submission status.
- Let admins review and approve or decline submissions. Staff must not be able to edit member or catalog data.
- Make registered motorcycle and plate information visible to admins in member account details and to admin/staff in POS vehicle selection.
- Enforce role and member-ownership checks in page access and server actions.

## Out of scope

- Marketing campaigns, promotional messaging, and marketing consent.
- Profile photo changes.
- Member editing/removing registered motorcycles or selecting a primary motorcycle.
- Staff approval of catalog submissions.
- Changing order processing, cancellation, pricing, or visit-count business rules.
- Destructive database operations, seeding, or production builds.

## Acceptance conditions

1. A member sees one responsive profile page with theme and logout controls; admin/staff routes and shell behavior remain intact.
2. Members can save their own name and phone, verify a new email before it replaces the old one, and change their own password through either allowed verification method.
3. Server-side member queries expose only that member’s orders, motorcycles, and suggestions; non-members cannot open `/member` pages or invoke member-only actions.
4. Every linked order appears with safe status, date, item names/quantities, and total. Only completed orders contribute to visit/spend totals.
5. A member can register an active catalog motorcycle and optional plate; staff/admin can see the plate in their POS selector and admins can see it in member details.
6. An unlisted motorcycle remains a suggestion until an admin approves it. Approval adds/reuses a shared catalog entry and associates it with the submitter; decline does not create a catalog record.
7. Staff cannot approve suggestions or edit member profile/motorcycle data.
8. TypeScript, focused lint, Prisma validation, and the Impeccable detector pass for new member UI. No production build, seed, or destructive DB action is run.

## Relevant implementation areas

- `src/app/(dashboard)/member/profile/page.tsx`
- `src/components/app-shell/AppShell.tsx`, `src/proxy.ts`
- `src/features/users/services/user.service.ts`
- `src/features/users/actions/`
- `src/features/users/components/Member*`
- `src/features/motor/actions/`, `src/features/motor/services/`, `src/features/motor/components/`
- `src/features/orders/components/pos/PosVehicleSelector.tsx`, `src/features/orders/types.ts`
- `prisma/schema.prisma`

## Ordered steps

1. Add the member portal query and additive motorcycle plate/submission schema.
2. Add member profile, email OTP, password change, member-owned motorcycle actions, and role checks.
3. Build the responsive member page without shared navigation, including profile/security, motorcycle registry, status, and order history.
4. Add admin review controls and read-only plate visibility for staff/admin.
5. Validate schema/types/lint/UI and review access boundaries. Apply only the additive schema change if the database reports no destructive changes; never accept data loss automatically.

## Resolved decisions

- Order view: all orders linked to the member; completed orders alone count as visits.
- Unknown motorcycle: submitted to an admin review queue before shared catalog use.
- Marketing remains a separate future feature with its own consent decision.
- Motorcycle editing/removal and primary-bike selection were suggested but not included in the approved scope.
