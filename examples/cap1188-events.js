const connect = require("../").connect;

// Connect to the CAP1188 breakout.
// Returns a promise that resolves to the
// CAP1188 instance when it's ready.
const connectionPromise = connect({ resetPin: 0 });

// When it's ready, add a listener that emits
// when a touch is registered
connectionPromise.then(cap1188 => {
  cap1188.on("change", function(evt) {
    console.log(evt);
  });

  cap1188.on("touch", function(pin) {
    console.log("pin touched: ", pin);
  });

  cap1188.on("release", function(pin) {
    console.log("pin released: ", pin);
  });

  cap1188.on(2, function(touched) {
    console.log("pin 2 is: ", touched ? "touched" : "released");
  });

  cap1188.on("reset", function() {
    console.log("reset");
  });

  cap1188.reset();
}, console.error);
