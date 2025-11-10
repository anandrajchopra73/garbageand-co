import { promisify } from 'util';
import { gzip, gunzip } from 'zlib';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

/**
 * Compress data before sending to database
 */
export async function compressData(data: any): Promise<Buffer> {
  try {
    const jsonString = JSON.stringify(data);
    const compressed = await gzipAsync(Buffer.from(jsonString, 'utf-8'));
    console.log(`Compression: ${jsonString.length} bytes -> ${compressed.length} bytes (${Math.round((1 - compressed.length / jsonString.length) * 100)}% reduction)`);
    return compressed;
  } catch (error) {
    console.error('Compression error:', error);
    throw new Error('Failed to compress data');
  }
}

/**
 * Decompress data when retrieving from database
 */
export async function decompressData(compressedData: Buffer): Promise<any> {
  try {
    const decompressed = await gunzipAsync(compressedData);
    const jsonString = decompressed.toString('utf-8');
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Decompression error:', error);
    throw new Error('Failed to decompress data');
  }
}

/**
 * Compress string data
 */
export async function compressString(text: string): Promise<Buffer> {
  try {
    return await gzipAsync(Buffer.from(text, 'utf-8'));
  } catch (error) {
    console.error('String compression error:', error);
    throw new Error('Failed to compress string');
  }
}

/**
 * Decompress string data
 */
export async function decompressString(compressedData: Buffer): Promise<string> {
  try {
    const decompressed = await gunzipAsync(compressedData);
    return decompressed.toString('utf-8');
  } catch (error) {
    console.error('String decompression error:', error);
    throw new Error('Failed to decompress string');
  }
}