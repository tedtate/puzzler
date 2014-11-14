var fs = require('fs');

var Cell = function(x, y, letter) {
    this.x = x;
    this.y = y;
    this.letter = letter;
    this.isBlank = letter === '.';
    this.acrossClue;
    this.downClue;
};

var Crossword = function(options) {

    if (options && options.filename) { // Filename
        this.decodeFileSync(options.filename)
    } else if (options && options.json) {

    } else if (options && options.raw) {
        this.decode(options.raw);
    }
    return this;
};

Crossword.prototype.isBlackCell = function(x, y) {
    var coord = x + (y * this.header.width);

    return this.puzzle.state[coord] === '.';
};

Crossword.prototype.needsAcrossNumber = function(x, y) {
    if (x === 0 || this.isBlackCell(x - 1, y)) {
        if (!this.isBlackCell(x, y)) {
            return true;
        }
    }
    return false;
};

Crossword.prototype.needsDownNumber = function(x, y) {
    if (y === 0 || this.isBlackCell(x, y - 1)) {
        if (!this.isBlackCell(x, y)) {
            return true;
        }
    }
    return false;
};

// Experimental async method a la fs
Crossword.decode = function(filename, callback) {
    fs.readFile(filename, function (error, data) {
        // todo : error

        var crossword = new Crossword({
            raw: data
        });

        if (callback) {
            callback(crossword);
        }
    })
};

Crossword.splitBufferAtNulls = function(buf, val) {
    var arr = [],
        p = 0,
        start = 0,
        length = 0;

    for (var i = 0; i < buf.length; i++) {
        if (buf[i] === 0) {
            length = i
            arr[p] = buf.slice(start, length)
            p++;
            start = length + 1;
        }
    }

    return arr;
};

Crossword.printBoard = function(board) {
    var output = '';

    for (var i = 0; i < board.length; i++) {
        var j = 0;
        for (j = 0; j < board[i].length; j++) {
            output += board[i][j].letter;
        }
        output += (i !== board.length - 1) ? '\n' : '';
    }
    return output;
};

Crossword.prototype.toJson = function() {
    return this;
};


Crossword.prototype.decodeFileSync = function(filename) {
    var data = fs.readFileSync(filename);
    return this.decode(data)
};


// Thanks to research @ http://code.google.com/p/puz/wiki/FileFormat
Crossword.prototype.decode = function (data) {

    // ********************* HEADER SECTION *********************
    this.header = {};
    this.header.checksum = data.slice(0x00, 0x00 + 0x02).readInt16LE(0);
    this.header.fileMagic = data.slice(0x02, 0x02 + 0x0B).toString();

    this.header.cibChecksum = data.slice(0x0E, 0x0E + 0x02).readInt16LE(0);
    this.header.maskedLowCheckSums = data.slice(0x10, 0x10 + 0x04).toString('hex');
    this.header.maskedHighCheckSums = data.slice(0x14, 0x14 + 0x04).toString('hex');

    this.header.version = data.slice(0x18, 0x18 + 0x04).toString();
    this.header.reserved1C = data.slice(0x1C, 0x1C + 0x02).toString('hex');
    this.header.scrambledChecksum = data.slice(0x1E, 0x1E + 0x02).readInt16LE(0);
    this.header.reserved20 = data.slice(0x20, 0x20 + 0x0C).toString('hex');
    this.header.width = data.slice(0x2C, 0x2C + 0x01).readInt8(0);
    this.header.height = data.slice(0x2D, 0x2D + 0x01).readInt8(0);
    this.header.scrambled = data.slice(0x32, 0x32 + 0x01).readInt8(0) != 0;
    this.header.numberOfClues = data.slice(0x2E, 0x2E + 0x02).readInt16LE(0);
    this.header.unknownBitmask = data.slice(0x30, 0x30 + 0x02).readInt16LE(0);
    this.header.scambledtag = data.slice(0x32, 0x32 + 0x02).readInt16LE(0);

    // ********************* PUZZLE LAYOUT AND STATE *********************

    var cells = this.header.width * this.header.height;
    var solutionStart = 0x34;
    var solutionEnd = solutionStart + cells;
    var stateStart = solutionStart + cells;
    var stateEnd = stateStart + cells;

    this.puzzle = {};
    this.puzzle.solution = data.slice(solutionStart, solutionEnd).toString()
    this.puzzle.state = data.slice(stateStart, stateEnd).toString()

    // ********************* STRING SECTION *********************

    var stringStart = stateEnd;
    var remainder = data.slice(stringStart);
    var fields = ['title', 'author', 'copyright'];
    var clueStart = 0;

    for (var i = 0, j = 0, fieldIndex = 0; i < remainder.length && fieldIndex < fields.length; i++) {

        var caret = remainder[i];

        if (caret === 0) {

            this.header[fields[fieldIndex]] = remainder.slice(j, i).toString();
            j = i + 1;
            fieldIndex++;
        }

        if (fieldIndex === 2) {
            clueStart = i + 1;
        }
    };

    this.details = {};

    remainder = data.slice(stringStart + clueStart + 1)
    remainder = Crossword.splitBufferAtNulls(remainder, 0x00);

    this.details.clues = [];

    for (var i = 0; i < this.header.numberOfClues; i++) {
        this.details.clues.push(remainder[i].toString());
    }

    this.board = function(puz) {
        var width = puz.header.width;
        var height = puz.header.height;

        var rows = new Array(height);
        var currentCell = 0;
        var acrossClues = {};
        var downClues = {};
        var clueNumber = 1;    // which clue this is on the board
        var cluePointer = 0;    // index into the array of clues

        var getClues = function(cell) {
            var assignedNumber = false;

            if (puz.isBlackCell(cell.x, cell.y)) {
                return;
            }

            // TODO: Mark that a particular cell has a clueNumber
            //    associated

            if (puz.needsAcrossNumber(cell.x, cell.y)) {
                assignedNumber = true;
                acrossClues[clueNumber] = {
                    clue: puz.details.clues[cluePointer],
                    row: cell.y,
                    col: cell.x,
                };
                cell.acrossClue = clueNumber;
                cluePointer += 1;
            }

            if (puz.needsDownNumber(cell.x, cell.y)) {
                assignedNumber = true;
                downClues[clueNumber] = {
                    clue: puz.details.clues[cluePointer],
                    row: cell.y,
                    col: cell.x,
                };
                cell.downClue = clueNumber;
                cluePointer += 1;
            }

            if (assignedNumber) {
                clueNumber += 1;
            }
        };

        for (var i = 0; i < rows.length; i++) {
            var col = new Array(width);

            for (var j = 0; j < col.length; j++) {
                var cell = new Cell(j, i, puz.puzzle.solution[currentCell]);
                col[j] = cell;
                currentCell += 1;

                getClues(cell);
            }
            rows[i] = col;
        }

        puz.clues = {
            across: acrossClues,
            down: downClues
        };

        return rows;
    }(this);

    // ********************* SPECIAL SECTION *********************

    if (remainder.length > this.header.numberOfClues) {
        // Found a special section
    }

};


module.exports = Crossword;
