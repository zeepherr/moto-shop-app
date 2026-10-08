import assert from "node:assert/strict";
import test from "node:test";
import { canUploadImageRole, canUsePosRole, isAdminRole } from "../src/features/auth/authorization.ts";
import { getLoginThrottleKeys } from "../src/features/auth/login-throttle-policy.ts";
import { clearDevelopmentLoginFailures, isDevelopmentLoginBlocked, recordDevelopmentLoginFailures } from "../src/features/auth/services/login-throttle-memory.ts";
import { isAccessSessionValid } from "../src/features/auth/session-validation.ts";
import { strongPasswordSchema, registerSchema, completeAdminPasswordResetSchema, passwordChangeSchema, passwordSetupSchema } from "../src/features/auth/schemas.ts";
import { resolveAuthSecret } from "../src/config/secrets.ts";
import { getBoundedPageWindow } from "../src/lib/pagination.ts";
import { isValidImageContent } from "../src/features/products/services/image-validation.ts";
import { MAX_IMAGE_SIZE, MAX_UPLOAD_REQUEST_SIZE, readRequestBodyWithinLimit, UploadRequestTooLargeError } from "../src/features/products/services/upload-validation.ts";
import { deleteProductThenCleanImage } from "../src/features/products/services/product-deletion.ts";

test("catalog mutation policy allows Admin only; POS and uploads retain Admin/Staff access", () => {
  for (const role of [null, undefined, "MEMBER", "STAFF", "UNKNOWN"]) assert.equal(isAdminRole(role), false);
  assert.equal(isAdminRole("ADMIN"), true);
  assert.equal(canUsePosRole("STAFF"), true);
  assert.equal(canUsePosRole("ADMIN"), true);
  assert.equal(canUsePosRole("MEMBER"), false);
  assert.equal(canUploadImageRole("STAFF"), true);
  assert.equal(canUploadImageRole("MEMBER"), false);
});

test("access sessions stop working immediately when revoked, expired, inactive, or mismatched", () => {
  const now = new Date("2026-10-09T00:00:00Z");
  const payload = { sessionId: 4, userId: 9 };
  const session = { userId: 9, revokedAt: null, expiresAt: new Date("2026-10-10T00:00:00Z"), user: { id: 9, isActive: true } };
  assert.equal(isAccessSessionValid(payload, session, now), true);
  assert.equal(isAccessSessionValid(payload, { ...session, revokedAt: now }, now), false);
  assert.equal(isAccessSessionValid(payload, { ...session, expiresAt: now }, now), false);
  assert.equal(isAccessSessionValid(payload, { ...session, user: { id: 9, isActive: false } }, now), false);
  assert.equal(isAccessSessionValid(payload, { ...session, userId: 10 }, now), false);
});

test("login throttle identifiers are stable, normalized, and do not expose email or IP", () => {
  const first = getLoginThrottleKeys("USER@example.com", "192.0.2.1", "test-throttle-secret");
  const normalized = getLoginThrottleKeys(" user@example.com ", "192.0.2.1", "test-throttle-secret");
  assert.deepEqual(first, normalized);
  assert.equal(first.length, 2);
  assert.equal(first.some((key) => key.includes("example") || key.includes("192.0.2.1")), false);
  assert.notDeepEqual(first, getLoginThrottleKeys("user@example.com", "192.0.2.2", "test-throttle-secret"));
});

test("development throttle fallback blocks repeated failures and can be cleared without database state", () => {
  const keys = ["development-fallback-test-email", "development-fallback-test-ip"];
  const now = new Date("2026-10-09T00:00:00Z");
  assert.equal(isDevelopmentLoginBlocked(keys, now, 15 * 60 * 1000), false);
  for (let attempt = 0; attempt < 4; attempt += 1) {
    recordDevelopmentLoginFailures(keys, now, 15 * 60 * 1000, 15 * 60 * 1000, 5, 50);
  }
  assert.equal(isDevelopmentLoginBlocked(keys, now, 15 * 60 * 1000), false);
  recordDevelopmentLoginFailures(keys, now, 15 * 60 * 1000, 15 * 60 * 1000, 5, 50);
  assert.equal(isDevelopmentLoginBlocked(keys, now, 15 * 60 * 1000), true);
  clearDevelopmentLoginFailures(keys);
  assert.equal(isDevelopmentLoginBlocked(keys, now, 15 * 60 * 1000), false);
});

test("password enrollment/reset/change schema requires a longer mixed password", () => {
  assert.equal(strongPasswordSchema.safeParse("four").success, false);
  assert.equal(strongPasswordSchema.safeParse("longpassword").success, false);
  assert.equal(strongPasswordSchema.safeParse("Longpass123").success, true);
  assert.equal(strongPasswordSchema.safeParse("A".repeat(129) + "1").success, false);
  assert.equal(registerSchema.safeParse({ email: "member@example.com", password: "short123", confirmPassword: "short123" }).success, false);
  assert.equal(passwordChangeSchema.safeParse({ currentPassword: "old-password", password: "short123", confirmPassword: "short123" }).success, false);
  assert.equal(completeAdminPasswordResetSchema.safeParse({ email: "admin@example.com", code: "123456", password: "short123", confirmPassword: "short123" }).success, false);
  assert.equal(passwordSetupSchema.safeParse({ token: "t".repeat(32), password: "short123", confirmPassword: "short123" }).success, false);
});

test("production refuses missing, short, and example auth secrets while development keeps its fallback", () => {
  assert.throws(() => resolveAuthSecret("JWT_SECRET", undefined, "dev-default", true));
  assert.throws(() => resolveAuthSecret("OTP_SECRET", "short", "dev-default", true));
  assert.throws(() => resolveAuthSecret("OTP_SECRET", "replace-with-another-random-string", "dev-default", true));
  assert.equal(resolveAuthSecret("JWT_SECRET", undefined, "dev-default", false), "dev-default");
  assert.equal(resolveAuthSecret("JWT_SECRET", "a".repeat(48), "dev-default", true), "a".repeat(48));
});

test("upload content validation accepts JPEG, PNG, and WebP signatures and rejects spoofed types", () => {
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0x00]);
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const webp = Buffer.from("RIFF0000WEBP", "ascii");
  assert.equal(isValidImageContent(jpeg, "image/jpeg"), true);
  assert.equal(isValidImageContent(png, "image/png"), true);
  assert.equal(isValidImageContent(webp, "image/webp"), true);
  assert.equal(isValidImageContent(jpeg, "image/png"), false);
  assert.equal(isValidImageContent(Buffer.from("<svg/>"), "image/svg+xml"), false);
});

test("upload request bodies are capped before multipart parsing", async () => {
  const allowed = await readRequestBodyWithinLimit(new Request("https://example.test/upload", { method: "POST", body: "1234" }), 4);
  assert.equal(allowed.toString(), "1234");
  await assert.rejects(
    () => readRequestBodyWithinLimit(new Request("https://example.test/upload", { method: "POST", body: "12345" }), 4),
    UploadRequestTooLargeError,
  );
  assert.equal(MAX_UPLOAD_REQUEST_SIZE, MAX_IMAGE_SIZE + 128 * 1024);
});

test("product storage cleanup runs only after database deletion and failure leaves a safe orphan", async () => {
  const calls = [];
  await deleteProductThenCleanImage(async () => calls.push("database"), async () => calls.push("storage"));
  assert.deepEqual(calls, ["database", "storage"]);

  calls.length = 0;
  await assert.rejects(() => deleteProductThenCleanImage(async () => { throw new Error("constraint"); }, async () => calls.push("storage")));
  assert.deepEqual(calls, []);

  await assert.doesNotReject(() => deleteProductThenCleanImage(async () => {}, async () => { throw new Error("storage"); }));
});

test("product and user query windows stay bounded for invalid and oversized requests", () => {
  assert.deepEqual(getBoundedPageWindow(0, 50), { skip: 0, take: 50 });
  assert.deepEqual(getBoundedPageWindow(-12, 10000), { skip: 0, take: 100 });
  assert.deepEqual(getBoundedPageWindow(Number.NaN, Number.NaN), { skip: 0, take: 50 });
});
