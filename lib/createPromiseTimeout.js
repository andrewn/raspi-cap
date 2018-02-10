module.exports = function(delay) {
  return function() {
    return new Promise(function(resolve) {
      setTimeout(resolve, delay);
    });
  };
};
