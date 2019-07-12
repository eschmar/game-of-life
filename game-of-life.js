/*
 *  game-of-life.js - v0.2.3
 *  HTML5 canvas game of life.
 *  https://github.com/eschmar/game-of-life
 *
 *  @author:   Marcel Eschmann, @eschmar
 *  @license:  MIT License
 */
;(function (window, document, undefined) {
  "use strict";

  // default config
  var defaults = {
    cellSize: 8,
    colors: ['#490D7F', '#B666FF', '#921AFF', '#5B337F', '#7515CC'],
    colorEmpty: '#fafafa',
    transparent: true,
    speed: 100,
    onClick: false
  };

  /**
   * Constructor.
   */
  function GameOfLife(selector, options) {
    this.element = document.querySelector(selector);
    if (this.element.nodeName !== 'CANVAS') return;
    this.settings = this.extend({}, defaults, options);
    this.init();
  }

  /**
   * Initialize canvas for game of life.
   */
  GameOfLife.prototype.init = function() {
    this.ctx = this.element.getContext('2d');
    this.xLength = Math.floor((this.element.width) / this.settings.cellSize);
    this.yLength = Math.floor((this.element.height) / this.settings.cellSize);

    // init array
    this.population = [];
    for (var i = 0; i < this.xLength; i++) {
        this.population[i] = [];
    }

    // init onclick event
    if (this.settings.onClick) this.initOnClick();
  };

  /**
   * Triggers custom handler on click/touch.
   */
  GameOfLife.prototype.initOnClick = function() {
    var self = this;
    var onClick = function(event) {
      var offset, left, top;
      var rect = self.element.getBoundingClientRect();

      left = event.pageX - rect.left + document.body.scrollLeft;
      top = event.pageY - rect.top + document.body.scrollTop;

      self.settings.onClick(self, Math.floor(left / self.settings.cellSize), Math.floor(top / self.settings.cellSize));
      event.stopPropagation();
    }

    this.element.addEventListener('click', onClick);
    this.element.addEventListener('touchstart', onClick);
  };

  /**
   * Populate a single cell.
   */
  GameOfLife.prototype.populate = function(x, y) {
    var color = Math.floor(Math.random() * this.settings.colors.length);
    this.ctx.fillStyle = this.settings.colors[color];
    this.ctx.fillRect(
      x*this.settings.cellSize+1, 
      y*this.settings.cellSize+1, 
      this.settings.cellSize-1, 
      this.settings.cellSize-1
    );
  };

  /**
   * Terminate life in a single cell.
   */
  GameOfLife.prototype.kill = function(x, y) {
    if (this.settings.transparent) {
      this.ctx.clearRect(
        x*this.settings.cellSize+1, 
        y*this.settings.cellSize+1, 
        this.settings.cellSize-1, 
        this.settings.cellSize-1
      );

      return;
    }

    this.ctx.fillStyle = this.settings.colorEmpty;
    this.ctx.fillRect(
      x*this.settings.cellSize+1, 
      y*this.settings.cellSize+1, 
      this.settings.cellSize-1, 
      this.settings.cellSize-1
    );
  };

  /**
   *  Plays the game of life according to rules:
   *  Any live cell with... 
   *      * fewer than two live neighbours dies, as if caused by under-population.
   *      * two or three live neighbours lives on to the next generation.
   *      * more than three live neighbours dies, as if by over-population.
   *  Any dead cell with...
   *      * exactly three live neighbours becomes a live cell, as if by reproduction.
   *
   *  Source:
   *  https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life#Rules
   */
  GameOfLife.prototype.live = function(x, y) {
    var neighbours = this.neighbours(x, y);

    // currently live cells:
    if (this.population[x][y] && (neighbours < 2 || neighbours > 3)) {
      this.future[x][y] = false;

    // currently dead cells
    }else if (neighbours === 3) {
      this.future[x][y] = true;
    }
  };

  /**
   * Counts the amount of populated neighbour cells.
   */
  GameOfLife.prototype.neighbours = function(x, y) {
    var count = 0, t, s;
    for (var i = -1; i < 2; i++) {
      for (var j = -1; j < 2; j++) {
        t = (x + i + this.xLength) % this.xLength;
        s = (y + j + this.yLength) % this.yLength;

        if (this.population[t][s]) {
          count++;
        }
      }
    }

    if (this.population[x][y]) {count--;};
    return count;
  };
  
  /**
   * Randomly populate the game.
   */
  GameOfLife.prototype.randomize = function() {
    for (var i = 0; i < this.xLength; i++) {
      for (var j = 0; j < this.yLength; j++) {
        if (Math.floor(Math.random() * 10 % 2)) {
          this.populate(i, j, 0);
          this.population[i][j] = true;
        }
      }
    }
  };

  /**
   * Terminate all life.
   */
  GameOfLife.prototype.killAll = function() {
    var _alive = this.alive;
    if (this.alive) { this.toggle(); }
    for (var i = 0; i < this.xLength; i++) {
      for (var j = 0; j < this.yLength; j++) {
        this.population[i][j] = false;
        this.kill(i,j);
      }
    }

    this.future = this.extend(true, [], this.population);
    if (_alive) { this.toggle(); }
  };

  /**
   * Add life form described by array.
   */
  GameOfLife.prototype.addLifeForm = function(x, y, coords) {
    var i, j, t;
    for (t = 0; t < coords.length; t++) {
      i = (x + coords[t][0] + this.xLength) % this.xLength;
      j = (y + coords[t][1] + this.yLength) % this.yLength;
      this.populate(i, j);
      this.population[i][j] = true;
    }
  };

  /**
   * Advance one step in time.
   */
  GameOfLife.prototype.advance = function() {
    // hard copy current population
    this.future = this.deepExtend([], this.population);

    // live life
    for (var i = 0; i < this.xLength; i++) {
      for (var j = 0; j < this.yLength; j++) {
        this.live(i, j);
      }
    }

    // update view
    for (var i = 0; i < this.xLength; i++) {
      for (var j = 0; j < this.yLength; j++) {
        if (this.population[i][j] !== this.future[i][j]) {
          if (this.future[i][j]) {
            this.populate(i, j);
          } else {
            this.kill(i, j);
          }
        }
      }
    }

    // back to the future
    this.population = this.future;
  };

  /**
   * (Un)freeze time.
   */
  GameOfLife.prototype.toggle = function() {
    if (!this.alive) {
      var self = this;
      this.timer = setInterval(function() {
        self.advance();
      }, this.settings.speed);
      this.alive = true;
    }else {
      clearInterval(this.timer);
      this.alive = false;
    }
  };

  //
  //  Polyfills
  //

  /**
   * Merge contents of two or more objects.
   */
  GameOfLife.prototype.extend = function(out) {
    out = out || {};

    for (var i = 1; i < arguments.length; i++) {
      if (!arguments[i]) continue;

      for (var key in arguments[i]) {
        if (!arguments[i].hasOwnProperty(key)) continue;
        out[key] = arguments[i][key];
      }
    }

    return out;
  };

  /**
   * Deep clone object.
   */
  GameOfLife.prototype.deepExtend = function(out) {
    out = out || {};

    for (var i = 1; i < arguments.length; i++) {
      var obj = arguments[i];
      if (!obj) continue;

      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === 'object') {
            out[key] = this.deepExtend(out[key], obj[key]);
          } else {
            out[key] = obj[key];
          }
        }
      }
    }

    return out;
  }

  //
  //  expose from private scope
  //

  window['GameOfLife'] = GameOfLife;

})(window, document);
