import crypto from 'node:crypto'

export default class RandomGenerator {
  static generateSecureKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  static generateRandomNumber(max) {
    let randomNum;
    do {
      randomNum = parseInt(crypto.randomBytes(4).toString('hex'), 16);
    } while (randomNum >= (Math.floor((0xFFFFFFFF + 1) / max) * max));
    return randomNum % max;
  }

  static generateHMACMessage(number, key) {
    return crypto.createHmac('sha3-256', key)
      .update(number.toString())
      .digest('hex');
  }
}

// module.exports = RandomGenerator;