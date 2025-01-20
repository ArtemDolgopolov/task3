import crypto from 'node:crypto';

export default class HmacGenerator {
  static generateHMAC(number, key) {
    return crypto.createHmac('sha3-256', key)
      .update(number.toString())
      .digest('hex');
  }
}