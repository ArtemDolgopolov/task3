import Table from 'ascii-table';
import ProbabilityCalculator from './ProbabilityCalculator.js';

export default class TableGenerator {
  constructor(dice) {
    this.dice = dice;
  }

  generateTable() {
    const table = new Table();
    table.setHeading('User dice v', ...this.dice.map(d => `[${d}]`));

    this.dice.forEach((playerDice, i) => {
      const row = [`[${playerDice}]`];
      this.dice.forEach((computerDice, j) => {
        if (i === j) {
          row.push('0');
        } else {
          const probability = ProbabilityCalculator.calculateWinProbability(playerDice, computerDice);
          row.push(`${probability.toFixed(4)}`);
        }
      });
      table.addRow(row);
    });

    console.log('Probability of the win for the user:');
    console.log(table.toString());
  }
}