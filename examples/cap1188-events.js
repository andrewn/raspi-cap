const connect = require("../").connect;

// Connect to the CAP1188 breakout.
// Returns a promise that resolves to the
// CAP1188 instance when it's ready.
const connectionPromise = connect();

// When it's ready, add a listener that emits
// when a touch is registered
connectionPromise.then(cap1188 => {
  cap1188.on("change", function(evt) {
    console.log(evt);
  });
});
