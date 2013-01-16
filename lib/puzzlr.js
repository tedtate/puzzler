var fs = require('fs');
var Crossword = require('./crossword').Crossword;
var Puzzler = exports;

// Thanks to research @ http://code.google.com/p/puz/wiki/FileFormat
Puzzler.decode = function(filename) {

  var data = fs.readFileSync(filename), json = {};   
  

  // ********************* HEADER SECTION *********************
  json.header = {}
  json.header.checksum             = data.slice(0x00, 0x00 + 0x02).readInt16LE(0  );
  json.header.fileMagic            = data.slice(0x02, 0x02 + 0x0B).toString(      );
 
  json.header.cibChecksum          = data.slice(0x0E, 0x0E + 0x02).readInt16LE(0  );
  json.header.maskedLowCheckSums   = data.slice(0x10, 0x10 + 0x04).toString('hex' );
  json.header.maskedHighCheckSums  = data.slice(0x14, 0x14 + 0x04).toString('hex' );
 
  json.header.version              = data.slice(0x18, 0x18 + 0x04).toString(      );
  json.header.reserved1C           = data.slice(0x1C, 0x1C + 0x02).toString('hex' );
  json.header.scrambledChecksum    = data.slice(0x1E, 0x1E + 0x02).readInt16LE(0  );
  json.header.reserved20           = data.slice(0x20, 0x20 + 0x0C).toString('hex' );
  json.header.width                = data.slice(0x2C, 0x2C + 0x01).readInt8(0     );
  json.header.height               = data.slice(0x2D, 0x2D + 0x01).readInt8(0     );
  json.header.scrambled            = data.slice(0x32, 0x32 + 0x01).readInt8(0) != 0;
  json.header.numberOfClues        = data.slice(0x2E, 0x2E + 0x02).readInt16LE(0  );
  json.header.unknownBitmask       = data.slice(0x30, 0x30 + 0x02).readInt16LE(0  );
  json.header.scambledtag          = data.slice(0x32, 0x32 + 0x02).readInt16LE(0  );
  
  // ********************* PUZZLE LAYOUT AND STATE *********************
  
  var cells = json.header.width * json.header.height;
  var solutionStart = 0x34;
  var solutionEnd = solutionStart + cells;
  var stateStart = solutionStart + cells;
  var stateEnd = stateStart + cells;

  json.puzzle = {};
  json.puzzle.solution = data.slice(solutionStart, solutionEnd).toString()
  json.puzzle.state    = data.slice(stateStart, stateEnd).toString()
  
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

  json.details = {};
  
  for (var i = 0, j = 0, fieldIndex = 0;
       i < remainder.length && fieldIndex < fields.length;
       i++) {

    var caret = remainder[i];
    
    if (caret === 0) {
      
      json.details[fields[fieldIndex]] = remainder.slice(j,i).toString();
      j = i + 1;
      fieldIndex++;
    }
    
    if (fieldIndex === 2) {
      clueStart = i+1;
    }
  };
  
  remainder = data.slice(stringStart + clueStart + 1)
  remainder = splitBufferAtNulls(remainder, 0x00);
  
  json.details.clues = [];
  
  for (var i = 0; i < json.header.numberOfClues; i++) {
    json.details.clues.push(remainder[i].toString());
  }    
  
  // ********************* SPECIAL SECTION *********************

  if (remainder.length > json.header.numberOfClues) {
    // Found a special section
  }
  
  // Return chainable Crossword object
  return new Crossword({ json: json });
};

