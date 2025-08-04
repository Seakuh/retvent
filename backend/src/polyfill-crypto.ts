import * as nodeCrypto from 'crypto';

// Only set crypto if it doesn't already exist
if (!(global as any).crypto) {
  (global as any).crypto = nodeCrypto;
}
