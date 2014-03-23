var Crossword = require('../lib/crossword');
var chai = require('chai');
var assert = chai.assert;
var fs = require('fs');

var fileName = __dirname + '/fixtures/chump.puz';
var buffer = fs.readFileSync(__dirname + '/fixtures/classic.puz');

var fileOpts = {filename: fileName};
var bufOpts = {raw: buffer};

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

            assert.equal(json.header.numberOfClues, 78);
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

            assert.equal(Crossword.printBoard(json.board), boardFixture);
        })
    });
});
