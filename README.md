# Raspberry Pi / Node.js module for the CAP1188 capacitive touch breakout

The CAP1188 is an 8-channel capacitive touch sensor and is available in a handy [breakout board](https://www.adafruit.com/products/1602). This module enables I2C communication with the chip to easily get information about which pins are being touched. It's based on [Espruino CAP1188 lirrary](http://www.espruino.com/modules/CAP1188.js) which itself is based on the [Adafruit CAP1188 Arduino libary](https://github.com/adafruit/Adafruit_CAP1188_Library).

## Wiring

You can wire this up as follows:

| Device Pin | Pi                                                              |
| ---------- | --------------------------------------------------------------- |
| 1 (GND)    | [Ground](https://pinout.xyz/pinout/ground)                      |
| 2 (VIN)    | [3.3v](https://pinout.xyz/pinout/pin1_3v3_power)                |
| 3 (SDA)    | [BCM 2/SDA](https://pinout.xyz/pinout/pin3_gpio2)               |
| 4 (SCK)    | [BCM 3/SCL](https://pinout.xyz/pinout/pin5_gpio3)               |
| RST        | [BCM 17 (0)](https://pinout.xyz/pinout/pin11_gpio17) Optional\* |

* Any GPIO pin can be used, see [Reset]() below.

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

### Reset

Optionally, you can connect the reset pin on the board (marked RST), to a pin on the Pi. Call the `reset()` method to reinitialize the sensor which can recalibrate it instead of having to cycle the power. A Promise is returned that resolves when the board has been reset.

See [this page about how to specify a pin](https://github.com/nebrius/raspi-gpio#pin-naming).

In addition, the `reset` event is also emitted.

```
var cap = require("CAP1188").connect(I2C1, { resetPin: 0 }); // using WiringPi number for BCM17
cap.reset(function () {
  // the board has been reset
});
```

## GUI

There's a tiny GUI you can run:

    sudo raspi-cap-debug

It'll show red circles (🔴) for untouched pins and blue circles (🔵) for touched pins.

## Buying

* [Adafruit](https://www.adafruit.com/products/1602)

## Future plans

* Add support for calling `reset()` to reset the board via the Reset pin
