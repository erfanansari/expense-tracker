import { DeleteObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { backupConfig } from '@configs/backup.config';

const BACKUP_PREFIX = 'backups/';

function getS3Client(): S3Client {
  if (!backupConfig.keyId || !backupConfig.applicationKey || !backupConfig.bucket || !backupConfig.endpoint) {
    throw new Error('Missing Backblaze B2 environment variables');
  }
  return new S3Client({
    region: backupConfig.region,
    endpoint: `https://${backupConfig.endpoint}`,
    credentials: {
      accessKeyId: backupConfig.keyId,
      secretAccessKey: backupConfig.applicationKey,
    },
  });
}

export async function uploadBackup(key: string, body: Buffer): Promise<void> {
  const s3 = getS3Client();
  await s3.send(
    new PutObjectCommand({
      Bucket: backupConfig.bucket,
      Key: `${BACKUP_PREFIX}${key}`,
      Body: body,
      ContentType: 'application/gzip',
    })
  );
}

export async function pruneOldBackups(retentionDays: number): Promise<string[]> {
  const s3 = getS3Client();
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  const deleted: string[] = [];

  const list = await s3.send(new ListObjectsV2Command({ Bucket: backupConfig.bucket, Prefix: BACKUP_PREFIX }));

  for (const object of list.Contents ?? []) {
    if (!object.Key || !object.LastModified) continue;
    if (object.LastModified.getTime() < cutoff) {
      await s3.send(new DeleteObjectCommand({ Bucket: backupConfig.bucket, Key: object.Key }));
      deleted.push(object.Key);
    }
  }

  return deleted;
}
