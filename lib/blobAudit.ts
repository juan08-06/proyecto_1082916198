import * as BlobPackage from '@vercel/blob';

const BlobClient = (BlobPackage as any).default ?? BlobPackage;

function getBlobToken(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN no está configurado');
  }
  return token;
}

function getBlobClient() {
  return new BlobClient({ token: getBlobToken() });
}

export async function withFileLock<T>(callback: () => Promise<T>): Promise<T> {
  return await callback();
}

export async function readAuditFile(path: string): Promise<string | null> {
  const blob = getBlobClient();

  try {
    const response = await blob.get(path);
    if (typeof response === 'string') {
      return response;
    }
    return JSON.stringify(response);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('not found')) {
      return null;
    }
    throw error;
  }
}

export async function writeAuditFile(path: string, content: string): Promise<void> {
  const blob = getBlobClient();
  await blob.put(path, content, {
    contentType: 'application/json',
  });
}
