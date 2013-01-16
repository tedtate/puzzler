var Crossword = function(options) {

  if (typeof options === 'string') {

  } else if (options.json) {
    this.json = options.json;
    this.decode();
  }
  return this;
};

Crossword.prototype.decode = function() {
  this.width = this.json.header.width
  this.height = this.json.header.height
  this.title = this.json.details.title
}

Crossword.prototype.toJson = function() {
  
  return {
    "height": this.height,
    "width": this.width,
    "title": this.title
  }
}

exports.Crossword = Crossword;