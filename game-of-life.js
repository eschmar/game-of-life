/*
 *  game-of-life.js - v0.1.0
 *  HTML5 canvas game of life.
 *  https://github.com/eschmar/game-of-life
 *
 *  @author:   Marcel Eschmann, @eschmar
 *  @license:  MIT License
 */
;(function ($, window, document, undefined) {
    "use strict";

    // default config
    var defaults = {
        cellSize: 8,
        colors: ['#490D7F', '#B666FF', '#921AFF', '#5B337F', '#7515CC'],
        colorEmpty: '#fafafa',
        transparent: true,
        speed: 100
    };

    // runtime variables
    var ctx,
        xLength,
        yLength,
        population,
        future,
        timer,
        alive;

    // constructor
    function GameOfLife (element, options) {
        this.element = element;

        // merge settings with defaults
        this.settings = $.extend({}, defaults, options);
        this.init();
    }

    $.extend(GameOfLife.prototype, {
        init: function (){
            this.ctx = this.element.getContext('2d');
            this.xLength = Math.floor((this.element.width) / this.settings.cellSize);
            this.yLength = Math.floor((this.element.height) / this.settings.cellSize);

            // init array
            this.population = [];
            for (var i = 0; i < this.xLength; i++) {
                this.population[i] = [];
            }
        },

        /**
         *  Populate a single cell
         */
        populate: function(x, y){
            var color = Math.floor(Math.random() * 10 % this.settings.colors.length);
            this.ctx.fillStyle = this.settings.colors[color];
            this.ctx.fillRect(
                x*this.settings.cellSize+1, 
                y*this.settings.cellSize+1, 
                this.settings.cellSize-1, 
                this.settings.cellSize-1
            );
        },

        /**
         *  Terminate life in a single cell
         */
        kill: function(x, y){
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
        },

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
        live: function(x, y){
            var neighbours = this.neighbours(x, y);

            // currently live cells:
            if (this.population[x][y] && (neighbours < 2 || neighbours > 3)) {
                this.future[x][y] = false;

            // currently dead cells
            }else if (neighbours == 3) {
                this.future[x][y] = true;
            }
        },

        /**
         *  Counts the amount of populated neighbour cells
         */
        neighbours: function(x, y) {
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

            return count;
        },

        /**
         *  Randomly populate the game
         */
        randomize: function() {
            for (var i = 0; i < this.xLength; i++) {
                for (var j = 0; j < this.yLength; j++) {
                    if (Math.floor(Math.random() * 10 % 2)) {
                        this.populate(i, j, 0);
                        this.population[i][j] = true;
                    }
                }
            }
        },

        /**
         *  Advance one step in time.
         */
        advance: function() {
            // hard copy current population
            this.future = $.extend(true, [], this.population);

            // live life
            for (var i = 0; i < this.xLength; i++) {
                for (var j = 0; j < this.yLength; j++) {
                    this.live(i, j);
                }
            }

            // update view
            for (var i = 0; i < this.xLength; i++) {
                for (var j = 0; j < this.yLength; j++) {
                    if (this.future[i][j] && this.population[i][j] !== this.future[i][j]) {
                        this.populate(i, j, 2);
                    }else {
                        this.kill(i, j);
                    }
                }
            }
            
            // back to the future
            this.population = this.future;
        },

        /**
         *  (Un)freeze time.
         */
        toggle: function() {
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
        }
    });

    // plugin wrapper
    $.fn["gameOfLife"] = function ( options ) {
        return this.each(function() {
            if (!$.data(this, "gameOfLife")) {
                $.data(this, "gameOfLife", new GameOfLife(this, options));
            }
        });
    };
})( jQuery, window, document );