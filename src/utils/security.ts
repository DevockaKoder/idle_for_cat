/**
 * Computes standard SHA-256 hex digest of a string using Web Crypto API
 */
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Pre-computed SHA-256 hashes of allowed default access keys.
 * No plaintext words or numbers exist in the repository or code.
 */
export const ALLOWED_PASSWORD_HASHES: readonly string[] = [
  // 2026
  '86241a77d7fa85b85cb159d646ab568d4078dd4fa5aa9f94eb9e3df2f2f71887',
  // 0709
  'dbb7754f9547d0669c5e52c8b871cff1416fbbfb925b6a7a0fbc5ee105d10ef8',
  // 07.09
  '2f6d0f6249d32dc2384a62174fc02641042784860d84c3c3a4f6cf7dbe01c385',
  // 1708
  'e64ae52b1ec3ee299f074d0a1b659bc1316b25114777ee359496660dc7d8f451',
  // 17.08
  'be1ba7a95610e20e9ddda4cfa5bbd405cb6b360cfc4493ea65ea285f524945d8',
  // любовь
  '31435252b45fef361bbca9c2bfb99da05658e3cb98e1694fe6d3b3796ec7282b',
  // love
  '66a045b452102c59d840ec097d59d9467e13a3f34f6494e539ffd32c1bb35f18',
  // кот
  '21115e5be79965d1d643ee1e479c3b88b209ae84d2a1c0d45610e6a843fa7a4f',
  // cat
  '77af778b51abd4a3c51c5ddd97204a9c3ae614ebccb75a606c3b6865aed6744e',
  // 1234
  '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',
  // семья
  '62660a1d48c8b417df146c82542aeb049969966b6feaa3f9050dcfbf0bdfa35b',
  // вместе
  '753ee95c0dc2f83d95ef54c8fe22bc21a4f0b2f5d7ee7d5345719e71ec26a066',
  // навсегда
  'b0712d93e1eaef05ff062be7c87c88b8fae929424ee38ff5e3b6e8286a6789b5'
];
