import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const isConfigured =
  !!process.env.STORAGE_ENDPOINT &&
  !!process.env.STORAGE_ACCESS_KEY_ID &&
  !!process.env.STORAGE_SECRET_ACCESS_KEY

function getS3Client(): S3Client | null {
  if (!isConfigured) return null
  return new S3Client({
    region: "auto",
    endpoint: process.env.STORAGE_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
      secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
    },
  })
}

const BUCKET = process.env.STORAGE_BUCKET ?? "brandbook-assets"
const PUBLIC_URL = process.env.STORAGE_PUBLIC_URL ?? ""

export type StorageUploadResult = {
  key: string
  publicUrl: string
  bucket: string
}

/** Upload a buffer or string to R2. Returns the public URL. */
export async function storageUpload(
  key: string,
  body: Buffer | string | Uint8Array,
  options: { contentType?: string; metadata?: Record<string, string> } = {}
): Promise<StorageUploadResult> {
  const client = getS3Client()

  if (!client) {
    // Fallback: return a fake URL for local dev without R2 configured
    console.warn("[storage] R2 not configured — skipping upload, returning placeholder URL")
    return { key, publicUrl: `/_placeholder/${key}`, bucket: BUCKET }
  }

  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: options.contentType ?? "application/octet-stream",
      Metadata: options.metadata,
    })
  )

  const publicUrl = PUBLIC_URL ? `${PUBLIC_URL}/${key}` : `/_r2/${key}`
  return { key, publicUrl, bucket: BUCKET }
}

/** Generate a presigned upload URL (for client-side direct upload). */
export async function storagePresignUpload(
  key: string,
  options: { contentType?: string; expiresIn?: number } = {}
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const client = getS3Client()
  if (!client) throw new Error("Storage not configured")

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: options.contentType,
  })
  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: options.expiresIn ?? 300,
  })
  const publicUrl = PUBLIC_URL ? `${PUBLIC_URL}/${key}` : uploadUrl.split("?")[0]
  return { uploadUrl, publicUrl }
}

/** Delete an object from R2. */
export async function storageDelete(key: string): Promise<void> {
  const client = getS3Client()
  if (!client) return
  await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}

/** Build a storage key for a project asset. */
export function buildAssetKey(projectId: string, assetKey: string, ext = "png"): string {
  const slug = assetKey.replace(/[^a-z0-9_-]/gi, "_").toLowerCase()
  return `projects/${projectId}/assets/${slug}.${ext}`
}

// Re-export GetObjectCommand for consumers that need it
export { GetObjectCommand }
