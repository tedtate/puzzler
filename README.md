# Puzzler.js
A node.js module for reading .puz files used in Across Lite. 

# Status: In Development

# Usage

    var Crossword = require('puzzlr').Crossword;
    var crossword = new Crossword('puzzle.puz');
        
    crossword.toJson(); # => formatted JSON 
    
     
# Status

1. `.toJson` method returns a bunch of different data but it isn't very well organized.
2. A couple of basic tests have been added but they barely touch the surface of what is needed.
