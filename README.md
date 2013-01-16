# Puzzler.js
A node.js module for reading .puz files used in Across Lite. 

# Status: In Development

# Usage

    var puz = require('puzzler');
    var crossword = Puzzler.decode('puzzle.puz');
    
    crossword.json; # => raw JSON corresponding to the .puz file
    
    crossword.toJson; # => formatted JSON for everyday usage
    
     
# Status
    
1. `.json` method returns the decoded .puz file.
2. `.toJson` method is stubbed out for now, is top priority
3. command line tools are next priority
