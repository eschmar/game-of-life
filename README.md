# Conway's game of life
Converts any HTML5 canvas element to a stage for [Conway's game of life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life). Written as a jQuery plugin. A demo can be seen at [eschmann.io](http://eschmann.io).

## Usage
```js
// init game of life on canvas object
var $game = $('#canvas');
$game.gameOfLife({});

// get instance
var game = $game.data("gameOfLife");

// generate population 
game.randomize();

// start simulation
game.toggle();
```

## Options
|key|value (default)|description|
|---|---|---|
|cellSize|integer (8)|Defines resolution|
|colors|array (['#000000', 'rgb(0,0,0)', ...)|New life will be drawn with a random color in this array. Write colors in hex or rgb format.|
|transparent|boolean (true)|If true, dead cells are transparent, else they adopt ``colorEmpty``.|
|colorEmpty|string ('#fafafa')|See ``transparent``.|
|speed|integer (100)|Defines the framerate in milliseconds.|
|onClick|function (false)|Adds click/touch event with available mouse position. Example usage: ``onClick: function(game, x, y){ game.addGlider(x,y); }``|

## Life forms
```js
game.addGlider(4,5);
```

|name|type|description|
|---|---|---|
|Glider|spaceship|[Smallest spaceship, by Richard K. Guy](http://www.conwaylife.com/wiki/Glider)|
|Weekender|spaceship|[Orthogonal spaceship, by David Eppstein](http://www.conwaylife.com/wiki/Weekender)|
|Siesta|oscillator|[Period 5 oscillator, by David Buckingham](http://www.conwaylife.com/wiki/Siesta)|

It's possible to explicitly place any life form on the grid using the general method ``addLifeForm(x, y, coords)``. The array coords contains paairs of offsets to be drawn (example glider: ``[[1,0], [2,1], [0,2], [1,2], [2,2]]``.

If you add life forms, please share them via pull request :)