export default class ProbabilityCalculator {
  static calculateWinProbability(playerDice, computerDice) {
    let playerWins = 0;
    let computerWins = 0;

    for (const pv of playerDice) {
      for (const cv of computerDice) {
        if (pv > cv) playerWins++;
        else computerWins++;
      }
    }
    
    return playerWins / 36;
  }
}