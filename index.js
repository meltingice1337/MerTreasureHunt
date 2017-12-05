const waves = require('./waves');
var start = new Date().getTime();
for (let i = 0; i < 1000; i++)
    console.log(waves.buildRawAddressFromSeed('sample twin final long merry stable grace margin wrap assault income put like kite morning'));
console.log("Call to doSomething took " + (end - start) + " milliseconds.")