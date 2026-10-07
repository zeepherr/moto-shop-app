import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import crypto from "node:crypto";
import { config } from "@/config";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.r2.accessKeyId,
    secretAccessKey: config.r2.secretAccessKey,
  },
});

export const getR2PublicUrl = (key: string): string => {
  if (!key) return "";
  if (key.startsWith("http://") || key.startsWith("https://")) return key;
  return `${config.r2.publicUrl}/${key}`;
};

const buildImageKey = (fileName: string, folder: "products" | "profiles"): string => {
  const extension = fileName.split(".").pop() || "jpg";
  const uniqueId = crypto.randomUUID().slice(0, 8);
  return `${folder}/${Date.now()}-${uniqueId}.${extension}`;
};

// Uploads happen server-side so the browser never calls R2 directly — this is
// what keeps the flow same-origin and free of any bucket CORS configuration.
export const uploadImageToR2 = async (
  buffer: Buffer,
  fileName: string,
  contentType: string,
  folder: "products" | "profiles" = "products",
): Promise<{ key: string; publicUrl: string }> => {
  const key = buildImageKey(fileName, folder);

  await r2Client.send(
    new PutObjectCommand({
      Bucket: config.r2.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  return { key, publicUrl: getR2PublicUrl(key) };
};

export const deleteImageFromR2 = async (key: string): Promise<void> => {
  if (!key) return;
  const command = new DeleteObjectCommand({
    Bucket: config.r2.bucketName,
    Key: key,
  });
  await r2Client.send(command);
};

export const deleteProfileImageFromUrl = async (photoUrl: string): Promise<void> => {
  const publicBase = config.r2.publicUrl.replace(/\/$/, "");
  const prefix = `${publicBase}/profiles/`;
  if (!publicBase || !photoUrl.startsWith(prefix)) return;
  const key = photoUrl.slice(publicBase.length + 1);
  if (!/^profiles\/[\w-]+\.(?:jpe?g|png|webp)$/i.test(key)) return;
  await deleteImageFromR2(key);
};
