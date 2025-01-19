const RandomGenerator = require('./RandomGenerator');
const readline = require('readline');

class DiceGame {
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
      console.log('Please provide at least two dice configurations.');
      this.rl.close();
      return;
    }

    let isValid = true;
    args.forEach((arg, idx) => {
      const numbers = arg.split(',').map(num => parseInt(num.trim()));
      if (numbers.length !== 6 || numbers.some(num => isNaN(num))) {
        console.log(`Error: Invalid dice configuration at index ${idx}. Example: 2,2,4,4,9,9`);
        isValid = false;
        process.exit(0);
      } else {
        this.dice.push(numbers);
      }
    });

    if (!isValid) {
      console.log("Please start over with valid inputs.");
      return;
    } else {
      this.firstPlayerChoice();
    }
  }

  async firstPlayerChoice() {
    const firstPlayer = RandomGenerator.generateRandomNumber(2);
    const secretKey = RandomGenerator.generateSecureKey();
    const compHMAC = RandomGenerator.generateHMACMessage(firstPlayer, secretKey);
 
    console.log("Let's determine who makes the first move.");
    console.log(`I selected a random value in the range 0..1 (HMAC=${compHMAC}).`);
    console.log('Try to guess my selection.');
    console.log('0 - 0');
    console.log('1 - 1');
    console.log('X - exit');
    console.log('? - help');
 
    let userSelection = await this.promptUser('Your selection: ');
 
    if (userSelection === 'x' || userSelection === 'X') {
      console.log('Exiting...');
      process.exit(0);
    }
    if (userSelection === '?') {
      console.log('In progress.');
      process.exit(0);
    }
 
    while (true) {
      const userNumber = parseInt(userSelection);
 
      if (isNaN(userNumber) || userNumber < 0 || userNumber > 1) {
       console.log('Invalid input. Please enter 0 or 1.');
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
      userSelection = await this.promptUser('Your selection: ');
    }
  }

  async startTurns(isComputerFirst) {
    let computerDice, playerDice;

    if (isComputerFirst) {
      computerDice = this.chooseRandomDice();
      console.log(`I make the first move and choose the [${computerDice}].`);
      playerDice = await this.promptForDice(computerDice);
    } else {
      playerDice = await this.promptForDice();
      computerDice = this.chooseRandomDice(playerDice);
      console.log(`I choose the [${computerDice}] dice.`);
    }

    console.log("It's time for my throw.");
    const computerThrow = await this.handleThrow(computerDice);

    console.log("It's time for your throw.");
    const playerThrow = await this.handleThrow(playerDice);

    this.evaluateResult(playerThrow, computerThrow);
  }

  chooseRandomDice(excludeDice) {
    const availableDice = this.dice.filter(d => d !== excludeDice);
    const randomIndex = RandomGenerator.generateRandomNumber(availableDice.length);
    return availableDice[randomIndex];
  }

  async promptForDice(excludeDice = null) {
    let choice;
 
    while (true) {
      console.log('Choose your dice:');
      let availableIndex = 0;
 
      this.dice.forEach((dice, idx) => {
        if (excludeDice === null || dice !== excludeDice) {
          console.log(`${availableIndex} - [${dice}]`);
          availableIndex++;
        }
      });
 
      choice = parseInt(await this.promptUser(`Your selection (0-${availableIndex - 1}): `));
 
      if (isNaN(choice) || choice < 0 || choice >= availableIndex) {
        console.log('Invalid input. Please enter a valid number within the range.');
      } else {
        let selectedDice = null;
        let newIndex = 0;
       
        this.dice.forEach((dice, idx) => {
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
    const compHMAC = RandomGenerator.generateHMACMessage(compIndex, secretKey);

    console.log(`I selected a random value in the range 0..5 (HMAC=${compHMAC}).`);
  
    let playerIndex;

    while (true) {
      const input = await this.promptUser('Add your number modulo 6 (0-5): ');
      playerIndex = parseInt(input);
    
      if (isNaN(playerIndex) || playerIndex < 0 || playerIndex > 5) {
        console.log('Invalid input. Please enter a number between 0 and 5.');
      } else {
        break;
      }
    }

    const result = (compIndex + playerIndex) % 6;

    console.log(`My number is ${compIndex} (KEY=${secretKey}).`);
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

module.exports = DiceGame;