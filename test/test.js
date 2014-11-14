var Crossword = require('../lib/crossword');
var chai = require('chai');
var assert = chai.assert;
var fs = require('fs');

var fileName = __dirname + '/fixtures/chump.puz';
var buffer = fs.readFileSync(__dirname + '/fixtures/classic.puz');

var fileOpts = {filename: fileName};
var bufOpts = {raw: buffer};

function printBoard(board) {
    var output = '';

    for (var i = 0; i < board.length; i++) {
        var j = 0;
        for (j = 0; j < board[i].length; j++) {
            output += board[i][j].letter;
        }
        output += (i !== board.length - 1) ? '\n' : '';
    }
    return output;
}

describe('Crossword', function() {
    describe('toJson', function() {

        it('should get the correct height of the puzzle', function() {
            var c = new Crossword(fileOpts);
            var json = c.toJson();
            
            assert.equal(json.header.width, 15);
        });

        it('should get the correct width of the puzzle', function() {
            var c = new Crossword(fileOpts);
            var json = c.toJson();
            
            assert.equal(json.header.height, 15);
        });

        it('should find the puzzle\'s title', function() {
            var c = new Crossword(fileOpts);
            var json = c.toJson();

            assert.equal(json.header.title, 'Chump Change');
        });

        it('should find the right number of clues', function() {
            var c = new Crossword(fileOpts);
            var json = c.toJson();
            var NUM_CLUES = 78;

            assert.equal(json.header.numberOfClues, NUM_CLUES);
            assert.equal(json.clues.across.length + json.clues.down.length, NUM_CLUES);
        });
    });

    describe('board', function() {
        it('gives us a valid crossword board', function() {
            var boardFixture = ['HUAC.TEMPO.RIMS',
                'USSR.ONTAP.EROO',
                'BEHINDBARS.HORN',
                '...TOOL...TANGO',
                'INSET.ONTHEBEAM',
                'NOURI.CURED.DNA',
                'RUNINS.MOA.....',
                'ENGAGEMENTRINGS',
                '.....PER.HADDIE',
                'AKA.TINAS.HEAVE',
                'BANKVAULT.ROKER',
                'ARENA...ARAL...',
                'CAME.HOBBYHORSE',
                'UTIL.ADELA.GELT',
                'SECT.HELEN.YOYO'
            ].join('\n');

            var c = new Crossword(bufOpts);
            var json = c.toJson();

            assert.equal(printBoard(json.board), boardFixture);
        })
    });
});
