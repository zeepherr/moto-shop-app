import { NextResponse } from "next/server";
import { ROLES } from "@/features/auth/constants";
import { getCurrentUser } from "@/features/auth/actions/session.action";
import { uploadImageToR2 } from "@/features/products/services/r2.service";
import { getVerifiedImageType } from "@/features/products/services/image-validation";
import { canUploadImageRole } from "@/features/auth/authorization";
import { MAX_IMAGE_SIZE, MAX_UPLOAD_REQUEST_SIZE, readRequestBodyWithinLimit, UploadRequestTooLargeError } from "@/features/products/services/upload-validation";

// Mirrors the legacy Express `upload.middleware.js` limits.
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const fail = (status: number, error: string) =>
  NextResponse.json({ success: false, error }, { status });

/**
 * Same-origin image upload. The browser posts multipart form data here and the
 * server performs the R2 PutObject, so no cross-origin (CORS) request is ever
 * made and the bucket needs no CORS policy.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !canUploadImageRole(user.role)) {
    return fail(403, "You are not authorized to upload images");
  }

  const contentLength = request.headers.get("content-length");
  const declaredLength = contentLength === null ? null : Number(contentLength);
  if (declaredLength !== null && (!Number.isFinite(declaredLength) || declaredLength > MAX_UPLOAD_REQUEST_SIZE)) {
    return fail(413, "Image upload request is too large");
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("multipart/form-data;")) {
    return fail(400, "Invalid upload request");
  }

  let formData: FormData;
  try {
    const body = await readRequestBodyWithinLimit(request, MAX_UPLOAD_REQUEST_SIZE);
    if (!body) return fail(400, "Invalid upload request");
    const boundedRequest = new Request(request.url, { method: "POST", headers: request.headers, body });
    formData = await boundedRequest.formData();
  } catch (error) {
    if (error instanceof UploadRequestTooLargeError) return fail(413, "Image upload request is too large");
    return fail(400, "Invalid upload request");
  }

  const entries = formData.getAll("image");
  if (entries.length !== 1) {
    return fail(400, "Exactly one image can be uploaded");
  }

  const file = entries[0];
  if (typeof file === "string" || !file) {
    return fail(400, "An image file is required");
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return fail(415, "Only JPEG, PNG, and WebP images are allowed");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return fail(413, "Image must not exceed 5 MB");
  }

  const purpose = formData.get("purpose");
  if (purpose !== null && purpose !== "profile") {
    return fail(400, "Invalid upload purpose");
  }
  if (user.role === ROLES.STAFF && purpose !== "profile") {
    return fail(403, "Staff can only upload profile images");
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const verifiedType = getVerifiedImageType(buffer);
    if (!verifiedType || verifiedType !== file.type) {
      return fail(415, "Image content does not match its declared file type");
    }
    const { key, publicUrl } = await uploadImageToR2(
      buffer,
      verifiedType,
      purpose === "profile" ? "profiles" : "products",
    );
    return NextResponse.json({ success: true, data: { key, publicUrl } });
  } catch {
    return fail(500, "Could not upload the image to storage");
  }
}
