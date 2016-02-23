/*
 *  game-of-life.js - v0.1.5
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
        speed: 100,
        onClick: false
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

            // init onclick event
            if (this.settings.onClick) {
                this.initOnClick();
            }
        },

        /**
         *  Triggers custom handler on click/touch
         */
        initOnClick: function() {
            var self = this;
            $(self.element).on('click touchstart', function(event) {
                var offset, left, top;
                offset = $(self.element).offset();
                left = event.pageX - offset.left;
                top = event.pageY - offset.top;
                self.settings.onClick(self, Math.floor(left / self.settings.cellSize), Math.floor(top / self.settings.cellSize));
                event.stopPropagation();
            });
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
            }else if (neighbours === 3) {
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

            if (this.population[x][y]) {count--;};
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
         *  Terminate all life.
         */
        killAll: function() {
            var _alive = this.alive;
            if (this.alive) { this.toggle(); }
            for (var i = 0; i < this.xLength; i++) {
                for (var j = 0; j < this.yLength; j++) {
                    this.population[i][j] = false;
                    this.kill(i,j);
                }
            }

            this.future = $.extend(true, [], this.population);
            if (_alive) { this.toggle(); }
        },

        /**
         *  Add life form described by array
         */
        addLifeForm: function(x, y, coords) {
            var i, j, t;
            for (t = 0; t < coords.length; t++) {
                i = (x + coords[t][0] + this.xLength) % this.xLength;
                j = (y + coords[t][1] + this.yLength) % this.yLength;
                this.populate(i, j);
                this.population[i][j] = true;
            }
        },

        /**
         *  Add glider: http://www.conwaylife.com/wiki/Glider
         */
        addGlider: function(x, y) {
            this.addLifeForm(x, y, [[1,0], [2,1], [0,2], [1,2], [2,2]]);
        },

        /**
         *  Add weekender: http://www.conwaylife.com/wiki/Weekender
         */
        addWeekender: function(x, y) {
            var coords = [
                [2,0], [15,0],
                [2,1], [15,1],
                [1,2], [3,2], [14,2], [16,2],
                [2,3], [15,3],
                [2,4], [15,4],
                [3,5], [7,5], [8,5], [9,5], [10,5], [14,5],
                [7,6], [8,6], [9,6], [10,6],
                [3,7], [4,7], [5,7], [6,7], [11,7], [12,7], [13,7], [14,7],
                [5,9], [12,9],
                [6,10], [7,10], [10,10], [11,10],
            ];
            this.addLifeForm(x, y, coords);
        },

        /**
         *  Custom life form advancing in a nice way.
         */
        addCustomLifeForm1: function(x, y) {
            var coords = [
                [2,0], [15,0],
                [2,1], [15,1],
                [1,2], [3,2], [14,2], [16,2],
                [2,3], [15,3],
                [2,4], [15,4],
                [3,5], [7,5], [8,5], [9,5], [10,5], [14,5],
                [7,6], [8,6], [9,6], [10,6],
                [3,7], [4,7], [5,7], [6,7], [11,7], [12,7], [13,7], [14,7],
                [5,9], [12,9],
                [6,10], [7,10], [10,9], [11,9],
            ];
            this.addLifeForm(x, y, coords);
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
                    if (this.population[i][j] !== this.future[i][j]) {
                        if (this.future[i][j]) {
                            this.populate(i, j);
                        }else {
                            this.kill(i, j);
                        }
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
})(jQuery, window, document);