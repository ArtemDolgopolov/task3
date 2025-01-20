import readline from 'readline';
import DiceConfigParser from './DiceConfigParser.js';
import Dice from './Dice.js';
import FairNumberGenerator from './FairNumberGenerator.js';
import RandomGenerator from './RandomGenerator.js';
import HmacGenerator from './HmacGenerator.js';
import TableGenerator from './TableGenerator.js';

export default class DiceGame {
  constructor() {
    this.players = ['Computer', 'Player'];
    this.dice = [];
    this.selectedDice = {};
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  setupGame() {
    const args = process.argv.slice(2);
    if (args.length < 3) {
      console.log('Please provide at least 3 dice configurations.');
      this.rl.close();
      return;
    }

    const parser = new DiceConfigParser();
    this.dice = parser.parseDiceConfigurations(args);

    const hasDuplicateDice = this.dice.some((dice, index) =>
      this.dice.findIndex(d => JSON.stringify(d) === JSON.stringify(dice)) !== index
    );
    
    if (hasDuplicateDice) {
      console.log('You cannot have identical dice. Please choose different dice.');
      this.rl.close();
      return;
    }

    this.firstPlayerChoice();
  }

  async firstPlayerChoice() {
    const firstPlayer = FairNumberGenerator.generateFairNumber(2);
    const secretKey = RandomGenerator.generateSecureKey();
    const compHMAC = HmacGenerator.generateHMAC(firstPlayer, secretKey);

    while (true) {
      console.log("Let's determine who makes the first move.");
      console.log("I selected a random value in the range 0..1.");
      console.log(`HMAC: ${compHMAC}`);
      console.log('Try to guess my selection.');
      console.log('0 - 0');
      console.log('1 - 1');
      console.log('X - exit');
      console.log('? - help');

      let userSelection = await this.promptUser('Your selection: ');

      if (userSelection === 'x' || userSelection === 'X') {
        console.log('Exiting...');
        process.exit(0);
      } else if (userSelection === '?') {
        this.showProbabilityTable();
        continue;
      }

      const userNumber = parseInt(userSelection);
      if (isNaN(userNumber) || userNumber < 0 || userNumber > 1) {
        console.log('Invalid input. Please enter 0 or 1, or choose X to exit, or ? for help.');
      } else {
        if (userNumber === firstPlayer) {
          console.log(`You guessed correctly! My number is ${firstPlayer}.`);
          console.log(`Key: ${secretKey}`);
          this.startTurns(false);
        } else {
          console.log(`Sorry! My number was ${firstPlayer}.`);
          console.log(`Key: ${secretKey}`);
          this.startTurns(true);
        }
        break;
      }
    }
  }

  showProbabilityTable() {
    const tableGenerator = new TableGenerator(this.dice);
    tableGenerator.generateTable();
  }

  async startTurns(isComputerFirst) {
    let computerDice, playerDice;

    if (isComputerFirst) {
      computerDice = Dice.chooseRandomDice(this.dice);
      console.log(`I make the first move and choose the [${computerDice}].`);
      playerDice = await this.promptForDice(computerDice);
    } else {
        playerDice = await this.promptForDice();
        computerDice = Dice.chooseRandomDice(this.dice, playerDice);
        console.log(`I choose the [${computerDice}] dice.`);
    }

    console.log("It's time for my throw.");
    const computerThrow = await this.handleThrow(computerDice);

    console.log("It's time for your throw.");
    const playerThrow = await this.handleThrow(playerDice);

    this.evaluateResult(playerThrow, computerThrow);
  }

  chooseRandomDice(excludeDice = null) {
    return Dice.chooseRandomDice(this.dice, excludeDice);
  }

  async promptForDice(excludeDice = null) {
    let choice;

    while (true) {
      console.log('Choose your dice:');
      let availableIndex = 0;

      this.dice.forEach((dice) => {
        if (excludeDice === null || dice !== excludeDice) {
          console.log(`${availableIndex} - [${dice}]`);
          availableIndex++;
        }
      });

      choice = await this.promptUser(`Your selection (0-${availableIndex - 1}, X for exit, ? for help): `);

      if (choice.toLowerCase() === 'x') {
        console.log('Exiting...');
        process.exit(0);
      } else if (choice === '?') {
          this.showProbabilityTable();
          continue;
      }

      choice = parseInt(choice);
      if (isNaN(choice) || choice < 0 || choice >= availableIndex) {
        console.log('Invalid input. Please enter a valid number within the range.');
      } else {
          let selectedDice = null;
          let newIndex = 0;

          this.dice.forEach((dice) => {
            if (excludeDice === null || dice !== excludeDice) {
              if (newIndex === choice) {
                selectedDice = dice;
              }
              newIndex++;
            }
          });

          return selectedDice;
        }
      }
    }

  async handleThrow(dice) {
    const secretKey = RandomGenerator.generateSecureKey();
    const compIndex = RandomGenerator.generateRandomNumber(6);
    const compHMAC = HmacGenerator.generateHMAC(compIndex, secretKey);

    console.log("I selected a random value in the range 0..5.");
    console.log(`HMAC: ${compHMAC}`);

    let playerIndex;

    while (true) {
      const input = await this.promptUser('Add your number modulo 6 (from 0 to 5), X to exit, ? for help: ');

      if (input.toLowerCase() === 'x') {
        console.log('Exiting...');
        process.exit(0);
      } else if (input === '?') {
          this.showProbabilityTable();
          continue;
      }

      playerIndex = parseInt(input);

      if (isNaN(playerIndex) || playerIndex < 0 || playerIndex > 5) {
        console.log('Invalid input. Please enter a number between 0 and 5.');
      } else {
          break;
      }
    }

    const result = (compIndex + playerIndex) % 6;

    console.log(`My number is ${compIndex}.`);
    console.log(`Key: ${secretKey}`);
    console.log(`The result is ${compIndex} + ${playerIndex} = ${result} (mod 6).`);
    console.log(`Throw result: ${dice[result]}.`);

    return dice[result];
  }

  evaluateResult(playerThrow, computerThrow) {
    console.log(`Your throw: ${playerThrow}, My throw: ${computerThrow}`);
    if (playerThrow > computerThrow) {
      console.log('You win!');
    } else if (playerThrow < computerThrow) {
        console.log('I win!');
    } else {
        console.log('It\'s a draw!');
    }
    this.rl.close();
  }

  promptUser(query) {
    return new Promise(resolve => {
      this.rl.question(query, input => {
        resolve(input);
      });
    });
  }
}