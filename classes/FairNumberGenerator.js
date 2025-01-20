import RandomGenerator from "./RandomGenerator.js";

export default class FairNumberGenerator {
  static generateFairNumber(max) {
    return RandomGenerator.generateRandomNumber(max);
  }
}