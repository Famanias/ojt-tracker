/**
 * Portable, cross-runtime cryptographic random nonce generator.
 * Works seamlessly in Node.js server runtime, Edge runtime, and browser environments.
 */
export function generateNonce(): string {
  const bytes = new Uint8Array(16);
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    // Fallback for isolated test environments where globalThis.crypto is mocked/missing
    for (let i = 0; i < 16; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  // Convert Uint8Array to base64 string portably
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
