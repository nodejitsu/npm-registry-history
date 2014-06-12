var url = require('url');
var util = require('util');
var path = require('path');
var Transform = require('stream').Transform;
var SeqFile = require('seq-file');
var Changes = require('changes-stream');
var level = require('level');

var extend = util._extend;

module.exports = History;

util.inherits(History, Transform);

// TODO: Decouple this from changes-stream if its ever useful by itself
function History (options) {
  if (!(this instanceof History)) return new History(options);
  var hwm = options.highWaterMark || 16;
  Transform.call(this, { objectMode: true, highWaterMark: hwm });

  this.couch = options.couch || 'https://skimdb.npmjs.com/registry';

  this.db = level(options.db || path.join(__dirname, 'sequence.db'),
                  { valueEncoding: 'json' });

  this.seq = new SeqFile(options.seq || path.join(__dirname, 'sequence.seq'));

  this.seq.read(this.start.bind(this));
}

History.prototype.start = function (err, seq) {

  this.since = +seq || 'now';

  this.changes = new Changes({
    db: this.couch,
    since: this.since,
    include_docs: true,
    inactivity_ms: 60 * 60 * 1000
  })

  this.changes
    .on('retry', this.emit.bind(this, 'retry'))
    .on('error', this.emit.bind(this, 'error'))
    .pipe(this);
};

History.prototype._transform = function(change, enc, callback) {

  this.since = change.seq;
  // Just for logging purposes
  this.emit('change', change);

  this.db.put(change.seq, change.doc, this._onPut.bind(this, change, callback));
};

History.prototype._onPut = function (change, done, err) {
  if (err) return this.emit('error', err);

  this.seq.save(change.seq);
  done(null, change);
};
