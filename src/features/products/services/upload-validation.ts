export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const MAX_MULTIPART_OVERHEAD = 128 * 1024;
export const MAX_UPLOAD_REQUEST_SIZE = MAX_IMAGE_SIZE + MAX_MULTIPART_OVERHEAD;

export class UploadRequestTooLargeError extends Error {
  constructor() {
    super("Upload request is too large");
    this.name = "UploadRequestTooLargeError";
  }
}

export const readRequestBodyWithinLimit = async (request: Request, maxBytes: number) => {
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel().catch(() => undefined);
      throw new UploadRequestTooLargeError();
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
};
