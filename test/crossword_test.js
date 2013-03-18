// TESTING
var Crossword = require('../lib/crossword');
var fileName = __dirname + '/chump.puz';

var crossword = new Crossword({filename: fileName});
var json = crossword.toJson();

var errors = []

if (json.height !== 15) {
  errors.push("Error: expected puzzle to have a height of 15 got " + json.height);
}

if (json.width !== 15) {
  errors.push("Error: expected puzzle to have a width of 15 got " + json.width);
}

if (json.title !== 'Chump Change') {
  errors.push("Error: expected title to be 'Chump Change' got '" + json.title + "'")
}

if (errors.length ) {
  errors.forEach(function(item){
    console.log(item);
  });
} else {
  console.log('All tests passed')
}

Crossword.decode(fileName, function(crossword){
  var errors = []

  if (json.height !== 15) {
    errors.push("Error: expected puzzle to have a height of 15 got " + json.height);
  }

  if (json.width !== 15) {
    errors.push("Error: expected puzzle to have a width of 15 got " + json.width);
  }

  if (json.title !== 'Chump Change') {
    errors.push("Error: expected title to be 'Chump Change' got '" + json.title + "'")
  }

  if (errors.length ) {
    errors.forEach(function(item){
      console.log(item);
    });
  } else {
    console.log('All tests passed')
  }
});

setInterval(function(){}, 1000);  