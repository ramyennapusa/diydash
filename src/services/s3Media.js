// S3 media access using Cognito Identity Pool credentials (Option B)
// When API returns imageKey / picture.key, use this to get a blob URL via GetObject
import { CognitoIdentityClient, GetIdCommand, GetCredentialsForIdentityCommand } from '@aws-sdk/client-cognito-identity';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { authConfig, isCognitoConfigured, getCognitoIdpLoginKey } from '../config/auth';
import { auth } from './auth';

const BUCKET = import.meta.env.VITE_S3_MEDIA_BUCKET || '';
const REGION = authConfig.region;

const blobUrlCache = new Map(); // key -> { url }

function revokeCached(key) {
  const entry = blobUrlCache.get(key);
  if (entry?.url) {
    try {
      URL.revokeObjectURL(entry.url);
    } catch (_) {}
    blobUrlCache.delete(key);
  }
}

/**
 * Get temporary credentials from Cognito Identity Pool using the current Id Token.
 * Calls GetId then GetCredentialsForIdentity.
 */
async function getIdentityCredentials() {
  if (!isCognitoConfigured || !BUCKET) return null;
  const idToken = await auth.getIdToken();
  if (!idToken) return null;
  const loginKey = getCognitoIdpLoginKey();
  if (!loginKey || !authConfig.identityPoolId) return null;

  const client = new CognitoIdentityClient({ region: REGION });
  const logins = { [loginKey]: idToken };

  const idRes = await client.send(
    new GetIdCommand({
      IdentityPoolId: authConfig.identityPoolId,
      Logins: logins,
    })
  );
  const identityId = idRes.IdentityId;
  if (!identityId) return null;

  const credRes = await client.send(
    new GetCredentialsForIdentityCommand({
      IdentityId: identityId,
      Logins: logins,
    })
  );
  const creds = credRes.Credentials;
  if (!creds?.AccessKeyId || !creds.SecretKey || !creds.SessionToken) return null;
  return {
    accessKeyId: creds.AccessKeyId,
    secretAccessKey: creds.SecretKey,
    sessionToken: creds.SessionToken,
  };
}

/**
 * Fetch S3 object and return a blob URL. Uses Identity Pool credentials.
 * Caller should not revoke the URL; we cache and revoke on next fetch for same key.
 * @param {string} key - S3 key (e.g. projects/xxx/pictures/yyy.jpg)
 * @returns {Promise<string | null>} Object URL or null
 */
export async function getS3ObjectUrl(key) {
  if (!key || typeof key !== 'string' || !key.trim()) return null;
  const k = key.trim();
  if (!BUCKET) return null;

  const credentials = await getIdentityCredentials();
  if (!credentials) return null;

  const s3 = new S3Client({
    region: REGION,
    credentials,
  });

  try {
    const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: k });
    const out = await s3.send(cmd);
    const body = out.Body;
    if (!body) return null;
    const contentType = out.ContentType || 'application/octet-stream';
    const bytes = await body.transformToByteArray();
    const blob = new Blob([bytes], { type: contentType });
    const url = URL.createObjectURL(blob);
    revokeCached(k);
    blobUrlCache.set(k, { url });
    return url;
  } catch (err) {
    console.warn('S3 getObject failed for key', k, err);
    return null;
  }
}

/**
 * Resolve S3 key to a blob URL via Identity Pool (no presigned URLs).
 * @param {string} [s3Key] - S3 key (e.g. from project.imageKey or picture.key)
 * @param {string} [fallbackUrl] - External http/https URL only (ignored if key)
 * @returns {Promise<string | null>} URL to use for img src
 */
export async function resolveImageUrl(s3Key, fallbackUrl) {
  if (s3Key && BUCKET && isCognitoConfigured) {
    const url = await getS3ObjectUrl(s3Key);
    if (url) return url;
  }
  return fallbackUrl || null;
}

export const isS3MediaConfigured = Boolean(BUCKET && isCognitoConfigured);
