export const backupConfig = {
  keyId: process.env.B2_KEY_ID,
  applicationKey: process.env.B2_APPLICATION_KEY,
  bucket: process.env.B2_BUCKET_NAME,
  endpoint: process.env.B2_ENDPOINT,
  // S3-compatible region segment is embedded in the endpoint, e.g. s3.ca-east-006.backblazeb2.com
  region: process.env.B2_ENDPOINT?.split('.')[1] ?? 'us-west-002',
  retentionDays: 30,
} as const;
