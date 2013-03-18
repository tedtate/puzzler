var fs = require('fs');

var Crossword = function(options) {

  if (options && options.filename) { // Filename
      this.decodeFileSync(options.filename)
  } else if (options && options.json) {
    
  } else if (options && options.raw) {
    this.decode(options.raw);
  }
  return this;
};

// Experimental async method a la fs
Crossword.decode = function(filename, callback) {
  fs.readFile(filename, function(error, data){
    // todo : error
    
    var crossword = new Crossword({ raw: data });
    
    if (callback) {
      callback(crossword);
    }
  })
}

Crossword.prototype.toJson = function() {
  
  return {
    "height": this.header.height,
    "width": this.header.width,
    "title": this.details.title
  }
  
}


Crossword.prototype.decodeFileSync = function(filename) {
  var data = fs.readFileSync(filename);
  return this.decode(data)
};


// Thanks to research @ http://code.google.com/p/puz/wiki/FileFormat
Crossword.prototype.decode = function(data) {
  
  // ********************* HEADER SECTION *********************
  this.header = {}
  this.header.checksum             = data.slice(0x00, 0x00 + 0x02).readInt16LE(0  );
  this.header.fileMagic            = data.slice(0x02, 0x02 + 0x0B).toString(      );
 
  this.header.cibChecksum          = data.slice(0x0E, 0x0E + 0x02).readInt16LE(0  );
  this.header.maskedLowCheckSums   = data.slice(0x10, 0x10 + 0x04).toString('hex' );
  this.header.maskedHighCheckSums  = data.slice(0x14, 0x14 + 0x04).toString('hex' );
 
  this.header.version              = data.slice(0x18, 0x18 + 0x04).toString(      );
  this.header.reserved1C           = data.slice(0x1C, 0x1C + 0x02).toString('hex' );
  this.header.scrambledChecksum    = data.slice(0x1E, 0x1E + 0x02).readInt16LE(0  );
  this.header.reserved20           = data.slice(0x20, 0x20 + 0x0C).toString('hex' );
  this.header.width                = data.slice(0x2C, 0x2C + 0x01).readInt8(0     );
  this.header.height               = data.slice(0x2D, 0x2D + 0x01).readInt8(0     );
  this.header.scrambled            = data.slice(0x32, 0x32 + 0x01).readInt8(0) != 0;
  this.header.numberOfClues        = data.slice(0x2E, 0x2E + 0x02).readInt16LE(0  );
  this.header.unknownBitmask       = data.slice(0x30, 0x30 + 0x02).readInt16LE(0  );
  this.header.scambledtag          = data.slice(0x32, 0x32 + 0x02).readInt16LE(0  );
  
  // ********************* PUZZLE LAYOUT AND STATE *********************
  
  var cells = this.header.width * this.header.height;
  var solutionStart = 0x34;
  var solutionEnd = solutionStart + cells;
  var stateStart = solutionStart + cells;
  var stateEnd = stateStart + cells;

  this.puzzle = {};
  this.puzzle.solution = data.slice(solutionStart, solutionEnd).toString()
  this.puzzle.state    = data.slice(stateStart, stateEnd).toString()
  
  // ********************* STRING SECTION *********************

  var splitBufferAtNulls = function(buf, val) {
    var arr = [], p = 0, start = 0, length = 0;
    
    for (var i = 0; i < buf.length; i++) {
      if (buf[i] === 0) {
        length = i
        arr[p] = buf.slice(start, length)
        p++;
        start = length + 1;
      } 
    }
    
    return arr;
  }
  
  var stringStart = stateEnd;
  var remainder = data.slice(stringStart);
  var fields = ['title', 'author', 'copyright'];
  var clueStart = 0;

  this.details = {};
  
  for (var i = 0, j = 0, fieldIndex = 0; i < remainder.length && fieldIndex < fields.length; i++) {

    var caret = remainder[i];
    
    if (caret === 0) {
      
      this.details[fields[fieldIndex]] = remainder.slice(j,i).toString();
      j = i + 1;
      fieldIndex++;
    }
    
    if (fieldIndex === 2) {
      clueStart = i+1;
    }
  };
  
  remainder = data.slice(stringStart + clueStart + 1)
  remainder = splitBufferAtNulls(remainder, 0x00);
  
  this.details.clues = [];
  
  for (var i = 0; i < this.header.numberOfClues; i++) {
    this.details.clues.push(remainder[i].toString());
  }    
  
  // ********************* SPECIAL SECTION *********************

  if (remainder.length > this.header.numberOfClues) {
    // Found a special section
  }
  
};


module.exports = Crossword;