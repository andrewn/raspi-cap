/* Copyright (c) 2018 Andrew Nicolaou. See the file LICENSE for copying permission. */
/*
  Module for Adafruit CAP1188 8-Key Capacitive Touch Sensor Breakout
  Only I2C is supported.

  See: https://www.adafruit.com/products/1602
  A port of the same library for Espruino:
    http://www.espruino.com/CAP1188
*/
const EventEmitter = require("events").EventEmitter;
const gpio = require("raspi-gpio");
const createPromiseTimeout = require("./createPromiseTimeout");

var C = {
  ADDRESS_DEFAULT: 0x29
};

/* Register addresses*/
var R = {
  MAIN_CONTROL: 0x00,
  SENSOR_INPUT_STATUS: 0x03,
  MULTI_TOUCH_CONFIG: 0x2a,
  STANDBY_CONFIG: 0x41,
  SENSOR_INPUT_LINKING: 0x72,
  LED_OUTPUT_CONTROL: 0x74
};

/* Bits within register for functions */
var B = {
  MAIN_CONTROL_INT: 0x0
};

class CAP1188 extends EventEmitter {
  constructor(_i2c, _opts) {
    super();

    _opts = _opts == null ? {} : _opts;
    this.i2c = _i2c;

    // Support old API where second param was _addr
    if (typeof _opts === "number") {
      this.addr = _opts;
    } else {
      this.addr = _opts.address || C.ADDRESS_DEFAULT;
      this.resetPin =
        _opts.resetPin != null ? new gpio.DigitalOutput(_opts.resetPin) : null;
    }

    this.pollingIntervalMs = _opts.pollingIntervalMs || 500;
    this.pollingId = null;
    this.lastTouches = [false, false, false, false, false, false, false, false];

    this.scheduleTouchPoll = this.scheduleTouchPoll.bind(this);

    // Begin polling touches when a "change" listener is
    // registered
    this.on("newListener", function(eventName) {
      if (eventName === "change" && this.pollingId == null) {
        this.scheduleTouchPoll();
      }
    });

    this.initialize();
  }

  /* Initialize the chip */
  initialize() {
    this.linkLedsToSensors();
    this.multipleTouches(true);
    // "Speed up a bit"
    this.i2c.writeSync(this.addr, R.STANDBY_CONFIG, Buffer.from([0x30]));
  }

  /* Begins polling for touches and
    emits events when they change */
  scheduleTouchPoll() {
    this.readTouchesAndEmit();
    this.pollingId = setTimeout(this.scheduleTouchPoll, this.pollingIntervalMs);
  }

  readTouchesAndEmit() {
    var lastTouches = this.lastTouches;
    var currentTouches = this.readTouches();
    var changes = [];

    for (var i = 0; i < 8; i++) {
      if (currentTouches[i] !== lastTouches[i]) {
        changes.push({ id: i, touched: currentTouches[i] });
      }
    }

    if (changes.length > 0) {
      this.emit("change", { changes: changes, touches: currentTouches });
      this.lastTouches = currentTouches;
    }
  }

  /* How many simultaneous touches to allow */
  multipleTouches(enable) {
    // 1 will block multiple touches
    this.writeBit(R.MULTI_TOUCH_CONFIG, 7, enable ? 0 : 1);
  }

  /* Link the LED to corresponding sensor */
  linkLedsToSensors() {
    for (var i = 0; i < 8; i++) {
      this.linkLedToSensor(i, 1);
    }
  }

  /* Link LED pin to sensor */
  linkLedToSensor(num, enable) {
    this.writeBit(R.SENSOR_INPUT_LINKING, num, enable);
  }

  /* Read state of all sensors */
  readTouches() {
    var touches = [],
      raw;

    // this.i2c.writeTo(this.addr, R.SENSOR_INPUT_STATUS);
    this.i2c.writeSync(this.addr, Buffer.from([R.SENSOR_INPUT_STATUS]));

    // raw = this.i2c.readFrom(this.addr, 1)[0];
    raw = this.i2c.readSync(this.addr, 1)[0];

    if (raw) {
      // Clear interrupt to be able to read again
      this.writeBit(R.MAIN_CONTROL, B.MAIN_CONTROL_INT, 0);
    }

    for (var i = 0; i < 8; i++) {
      touches[i] = this.getBit(raw, i);
    }

    return touches;
  }

  /* Reset the chip if a reset pin has been specified */
  reset() {
    const delay = 100;
    const pin = this.resetPin;
    const self = this;

    if (pin == null) {
      throw new Error("CAP1188 reset called but no resetPin given");
    }

    const timeout = createPromiseTimeout(delay);

    const writeHigh = function() {
      pin.write(gpio.HIGH);
    };

    const writeLow = function() {
      pin.write(gpio.LOW);
    };

    return new Promise(function(resolve, reject) {
      writeLow();
      timeout()
        .then(writeHigh)
        .then(timeout)
        .then(writeLow)
        .then(timeout)
        .then(function() {
          self.initialize();
          self.emit("reset");
          resolve();
        })
        .catch(reject);
    });
  }

  /*  */
  getBit(byt, position) {
    return 1 == ((byt >> position) & 1);
  }

  /* Set a single bit in a register */
  writeBit(reg, bit, val) {
    this.i2c.writeSync(this.addr, Buffer.from([reg]));

    var b = this.i2c.readSync(this.addr, 1)[0];

    b = val !== 0 ? b | (1 << bit) : b & ~(1 << bit);

    this.i2c.writeSync(this.addr, reg, Buffer.from([b]));
  }

  /* Set more bits in a register */
  writeBits(reg, shift, val) {
    this.i2c.writeSync(this.addr, Buffer.from([reg]));
    var b = this.i2c.readSync(this.addr, 1)[0];

    b = b | (val << shift);
    this.i2c.writeSync(this.addr, reg, Buffer.from([b]));
  }
}

exports.connect = function(_i2c, _addr) {
  return new CAP1188(_i2c, _addr);
};
