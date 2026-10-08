import { NextResponse } from "next/server";
import { ROLES } from "@/features/auth/constants";
import { getCurrentUser } from "@/features/auth/actions/session.action";
import { uploadImageToR2 } from "@/features/products/services/r2.service";

// Mirrors the legacy Express `upload.middleware.js` limits.
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const fail = (status: number, error: string) =>
  NextResponse.json({ success: false, error }, { status });

/**
 * Same-origin image upload. The browser posts multipart form data here and the
 * server performs the R2 PutObject, so no cross-origin (CORS) request is ever
 * made and the bucket needs no CORS policy.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== ROLES.ADMIN && user.role !== ROLES.STAFF)) {
    return fail(403, "You are not authorized to upload images");
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
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
    const { key, publicUrl } = await uploadImageToR2(
      buffer,
      file.name,
      file.type,
      purpose === "profile" ? "profiles" : "products",
    );
    return NextResponse.json({ success: true, data: { key, publicUrl } });
  } catch {
    return fail(500, "Could not upload the image to storage");
  }
}
