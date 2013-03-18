# Puzzler.js
A node.js module for reading .puz files used in Across Lite. 

# Status: In Development

# Usage

    var Crossword = require('puzzlr').Crossword;
    var crossword = new Crossword('puzzle.puz');
        
    crossword.toJson(); # => formatted JSON 
    
     
# Status

1. `.toJson` method is stubbed out for now, is top priority
2. command line tools are next priority
