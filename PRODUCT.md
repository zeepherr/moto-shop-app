# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Workshop administrators operate HurngMoto at the shop. They register members and staff, maintain access to internal tools, and resolve incomplete enrollment safely while serving customers.

Members and staff use the accounts created by an administrator to sign in and later complete their own profile information.

## Product Purpose

HurngMoto is a motorcycle workshop and point-of-sale system for managing shop operations, inventory, service work, customer accounts, and staff access.

## Positioning

Account creation begins at the shop under administrator control: the administrator selects the person’s permitted role and starts a verified enrollment without ever choosing or seeing that person’s password.

## Operating Context

- Administrators create Member or Staff enrollments while assisting people at the shop.
- Self-service approval sends a generic `/register` link; the person creates a password and confirms an emailed OTP.
- Counter-assisted registration sends an OTP to the person; an administrator verifies the disclosed code, then the person receives a single-use password-setup link and a login link.
- Account access, role changes, enrollment recovery, and audit history are operational tasks performed by administrators.

## Capabilities and Constraints

- Public registration requires an unexpired administrator approval.
- Enrollment creation accepts Member and Staff only; Administrator accounts are managed separately.
- Administrators enter an email only and do not set names or passwords for a new user. New accounts use a default name until the person updates their profile.
- Unfinished enrollments must be resumed, resent, cancelled, or explicitly restarted; they must never be silently overwritten.
- Deactivated users remain in the system, retain operational history, and can be reactivated.
- User Management records audit events for enrollment, delivery, access, and role changes.

## Brand Commitments

HurngMoto uses the existing Apple-inspired management interface and action-blue interaction language documented in `DESIGN.md`.

## Evidence on Hand

- Live product data is stored in Neon PostgreSQL through Prisma.
- Operational User Management routes and enrollment flows exist under `src/app/(dashboard)/admin/users` and `src/features/auth`.
- No fabricated operational metrics, delivery results, or sign-in history may be presented.

## Product Principles

1. Keep account administration safe and explicit.
2. Put the next operational action ahead of passive account data.
3. Preserve history while making access changes reversible.
4. Make recovery states clear enough to resolve during a customer interaction.
