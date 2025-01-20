export default class DiceConfigParser {
 parseDiceConfigurations(args) {
   const dice = [];
   let isValid = true;

   args.forEach((arg, idx) => {
     const numbers = arg.split(',').map(num => parseInt(num.trim()));
     if (numbers.length !== 6 || numbers.some(num => isNaN(num))) {
       console.log(`The die № ${idx + 1} is wrong. Example: 2,2,4,4,9,9`);
       isValid = false;
       process.exit(0)
     } else {
         dice.push(numbers);
     }
   });

   if (!isValid) {
     console.log("Please start over with valid inputs.");
   }

   return dice;
 }
}