import RandomGenerator from "./RandomGenerator.js";

export default class Dice {
  static chooseRandomDice(dice, excludeDice) {
    const availableDice = dice.filter(d => d !== excludeDice);
    const randomIndex = RandomGenerator.generateRandomNumber(availableDice.length);
    return availableDice[randomIndex];
  }
}