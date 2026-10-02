import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "node:crypto";
import { config } from "@/config";
import type { PresignedUploadResult } from "../types";

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

export const createPresignedUploadUrl = async (
  fileName: string,
  contentType: string,
): Promise<PresignedUploadResult> => {
  const extension = fileName.split(".").pop() || "jpg";
  const uniqueId = crypto.randomUUID().slice(0, 8);
  const key = `products/${Date.now()}-${uniqueId}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: config.r2.bucketName,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

  return {
    uploadUrl,
    key,
    publicUrl: getR2PublicUrl(key),
  };
};

export const deleteImageFromR2 = async (key: string): Promise<void> => {
  if (!key) return;
  const command = new DeleteObjectCommand({
    Bucket: config.r2.bucketName,
    Key: key,
  });
  await r2Client.send(command);
};
