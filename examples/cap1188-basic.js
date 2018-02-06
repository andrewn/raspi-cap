const connect = require('../').connect;

// Connect to the CAP1188 breakout.
// Returns a promise that resolves to the
// CAP1188 instance when it's ready.
const connectionPromise = connect();

// When it's ready, begin a loop to read
// the touches
connectionPromise.then(cap1188 => {
  setInterval(() => {
    // touches is an array of booleans
    // true means it's touched, false if not
    const touches = cap1188.readTouches();
    console.log(touches);
  }, 100);
});
