import { PayOS } from '@payos/node';

export const payOS = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID || 'DEMO_CLIENT_ID',
  apiKey: process.env.PAYOS_API_KEY || 'DEMO_API_KEY',
  checksumKey: process.env.PAYOS_CHECKSUM_KEY || 'DEMO_CHECKSUM_KEY',
});
