var HangmanCanvas = function(canvas) {
  this._ctx = canvas.getContext('2d');
  this._errors = 0;

  // initialize game
  this._ctx.lineWidth = 10;
  this._ctx.strokeStyle = 'green';
  this._drawLine([20,190], [180,190]);
};
HangmanCanvas.MAX_ERRORS = 8;
HangmanCanvas.prototype._drawLine = function(from, to) {
  this._ctx.beginPath();
  this._ctx.moveTo(from[0], from[1]);
  this._ctx.lineTo(to[0], to[1]);
  this._ctx.stroke();
};
HangmanCanvas.prototype.next = function() {
  this._errors++;
  switch (this._errors) {
  case 1:
    // create the upright
    this._ctx.strokeStyle = '#A52A2A';
    this._drawLine([30,185], [30,10]);
    break;
  case 2:
    this._ctx.lineTo(150,10);
    this._ctx.stroke();
    break;
  case 3:
    this._ctx.strokeStyle = 'black';
    this._ctx.lineWidth = 3;
    // draw rope
    this._drawLine([145,15], [145,30]);
    // draw head
    this._ctx.beginPath();
    this._ctx.moveTo(160, 45);
    this._ctx.arc(145, 45, 15, 0, (Math.PI/180)*360);
    this._ctx.stroke();
    break;
  case 4:
    this._drawLine([145,60], [145,130]);
    break;
  case 5:
    this._drawLine([145,80], [110,90]);
    break;
  case 6:
    this._drawLine([145,80], [180,90]);
    break;
  case 7:
    this._drawLine([145,130], [130,170]);
    break;
  case 8:
    this._drawLine([145,130], [160,170]);
    break;
  }
};
HangmanCanvas.prototype.isManDead = function() {
  return this._errors >= HangmanCanvas.MAX_ERRORS;
};

var RevealPhrase = function(elem, phrase, letters) {
  this._elem = elem;
  this._phrase = phrase.toUpperCase();

  this._index = {};
  this._state = [];
  this._divs = [];
  _.each(letters, function(letter, i) {
    this._index[letter] = [];
  }.bind(this));
  _.each(this._phrase, function(ch, i) {
    if (_.has(this._index, ch)) {
      this._index[ch].push(i);
      this._state.push(null);
    } else {
      this._state.push(ch);
    }
  }.bind(this));
};
RevealPhrase.prototype.init = function() {
  _.each(this._state, function(ch, i) {
    var div;
    if (ch === null) {
      div = $('<div />')
        .addClass('reveal-letter')
        .attr('data-index', i)
        .appendTo(this._elem);
    } else {
      div = $('<div />')
        .addClass('reveal-punctuation')
        .html(ch)
        .appendTo(this._elem);
    }
    this._divs.push(div);
  }.bind(this));
};
RevealPhrase.prototype.reveal = function(letter) {
  if (!_.has(this._index, letter)) {
    return false;
  }
  var positions = this._index[letter];
  for (var i = 0; i < positions.length; i++) {
    this._divs[positions[i]].html(letter);
    this._state[positions[i]] = letter;
  }
  return positions.length > 0;
};
RevealPhrase.prototype.isAllRevealed = function() {
  for (var i = 0; i < this._state.length; i++) {
    if (this._state[i] === null) {
      return false;
    }
  }
  return true;
};

var phrase = $('#expected').val();
// TODO: remove console.log()
console.log(phrase);
var letters = $('#letters').val();
var revealPhrase = new RevealPhrase($('#reveal_phrase'), phrase, letters);
revealPhrase.init();
var canvas = document.getElementById('canvas_hangman');
var hangmanCanvas = new HangmanCanvas(canvas);

$('.letter').click(function onLetterClick() {
  var letter = $(this).text().trim();
  var success = revealPhrase.reveal(letter);
  $(this)
    .addClass('letter-used')
    .toggleClass('letter-fail', !success)
    .off('click');
  if (success) {
    if (revealPhrase.isAllRevealed()) {
      $('.letter')
        .off('click');
      $('#letters_wrapper')
        .addClass('hide');
      $('#form_success')
        .removeClass('hide');
    }
  } else {
    hangmanCanvas.next();
    if (hangmanCanvas.isManDead()) {
      $('.letter')
        .off('click');
      $('#letters_wrapper')
        .addClass('hide');
      $('#link_failure')
        .removeClass('hide');
    }
  }
});
