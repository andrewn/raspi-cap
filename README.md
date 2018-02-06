# Raspberry Pi / Node.js module for the CAP1188 capacitive touch breakout

The CAP1188 is an 8-channel capacitive touch sensor and is available in a handy [breakout board](https://www.adafruit.com/products/1602). This module enables I2C communication with the chip to easily get information about which pins are being touched. It's based on [Espruino CAP1188 lirrary](http://www.espruino.com/modules/CAP1188.js) which itself is based on the [Adafruit CAP1188 Arduino libary](https://github.com/adafruit/Adafruit_CAP1188_Library).

## Wiring

You can wire this up as follows:

| Device Pin | Pi                                                |
| ---------- | ------------------------------------------------- |
| 1 (GND)    | [Ground](https://pinout.xyz/pinout/ground)        |
| 2 (VIN)    | [3.3v](https://pinout.xyz/pinout/pin1_3v3_power)  |
| 3 (SDA)    | [BCM 2/SDA](https://pinout.xyz/pinout/pin3_gpio2) |
| 4 (SCK)    | [BCM 3/SCL](https://pinout.xyz/pinout/pin5_gpio3) |

## Install

### Enable I2C on the Pi

1. `sudo raspi-config`
2. "Interfacing Options"
3. "I2C"
4. "Would you like the ARM I2C interface to be enabled?" -> "YES"
5. "OK"
6. "Finish"

### Install this library

`npm install --save https://github.com/andrewn/raspi-cap/archive/master.tar.gz`

## Usage

Basic usage:

```js
const connect = require("raspi-cap").connect;

// Connect to the CAP1188 breakout.
// When it's ready, the Promise resolves
// with the CAP1188 instance
connect().then(cap1188 => {
  // Returns an array of 8 items for pins C1 - C8
  //  true indicates a touch, false is no touch
  // e.g. C6 is being touched
  // [ false, false, false, false, false, true, false, false ]
  const touches = cap1188.readTouches();
  console.log(touches);
});
```

See the [`examples`](./examples) directory for more examples.

## GUI

There's a tiny GUI you can run:

    sudo raspi-cap-debug

It'll show red circles (🔴) for untouched pins and blue circles (🔵) for touched pins.

## Buying

* [Adafruit](https://www.adafruit.com/products/1602)

## Future plans

* Add support for calling `reset()` to reset the board via the Reset pin
