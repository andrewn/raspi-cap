const init = require('raspi').init;
const I2C = require('raspi-i2c').I2C;

const connect = require('./lib/CAP1188').connect;

module.exports.connect = ({ i2c = new I2C() } = {}) => {
  return new Promise((resolve, reject) => {
    init(() => {
      const cap1188 = connect(i2c);
      resolve(cap1188);
    });
  });
};
