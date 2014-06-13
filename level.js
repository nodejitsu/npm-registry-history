var level = require('level');

module.exports = function (path, opts) {
  var db = level(path || 'sequence.db', opts);

  return db;
};
