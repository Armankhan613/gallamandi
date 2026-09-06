const path = require('path');
const crypto = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'product-images';

function assertStorageConfig() {
  if (!SUPABASE_URL) {
    throw new Error('SUPABASE_URL is not configured');
  }

  if (!SUPABASE_SECRET_KEY) {
    throw new Error('SUPABASE_SECRET_KEY is not configured');
  }
}

function extensionForMime(mimeType) {
  const extensions = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
  };

  return extensions[mimeType] || path.extname('image' + mimeType.split('/')[1]) || '';
}

async function uploadProductImage(file) {
  assertStorageConfig();

  const extension = extensionForMime(file.mimetype);
  const storagePath = `products/${crypto.randomUUID()}${extension}`;

  const endpoint = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/${encodeURIComponent(
    SUPABASE_STORAGE_BUCKET,
  )}/${storagePath.split('/').map(encodeURIComponent).join('/')}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SECRET_KEY,
      'Content-Type': file.mimetype,
      'Cache-Control': '3600',
      'x-upsert': 'false',
    },
    body: file.buffer,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase Storage upload failed (${response.status}): ${text}`);
  }

  const publicUrl = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${encodeURIComponent(
    SUPABASE_STORAGE_BUCKET,
  )}/${storagePath.split('/').map(encodeURIComponent).join('/')}`;

  return { path: storagePath, publicUrl };
}

module.exports = {
  uploadProductImage,
};
