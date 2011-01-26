// Zier: Snake with Quadratic Bezier Curves
//
// The current version only supports one Zier and one apple.

/*************
* Game Logic *
**************/

MIN_SPEED = 0.006;
SPEED_DELTA = 0.0007;
MAX_SPEED = 0.025;
MAX_DELTA_T = 0.1;
APPLE_RADIUS = 0.05;
MAX_POS = 2;
SHRINK_RATE = 0.002;

Game = function(numZiers) {
  this.ziers = [new Zier(new Point(0, 0), new Point(0.2, 0.2))];
  this.numSteps = 0;
  this.curves = [];  // All remaining curves, not including current ones
  this.apple = new Point(0.3, 0.3);
  this.score = 0;
  this.shrinkingCurve = null;
  this.shrinkingT = 0;
}

Game.prototype.step = function() {
  var z = this.ziers[0];
  if (z.dead()) { return; }
  this.numSteps++;

  // Shrink the shrinking curve
  if (this.shrinkingCurve == null && this.curves.length > 0) {
    this.shrinkingCurve = this.curves[0];
  } 
  if (this.shrinkingCurve) {
    if (this.shrinkingT >= 1) {
      this.shrinkingT = 0;
      this.curves.shift();
      this.shrinkingCurve = null;
    } else {
      this.curves[0] = this.shrinkingCurve.truncate(this.shrinkingT, 1);
      this.shrinkingT += SHRINK_RATE 
          / this.shrinkingCurve.gradient(this.shrinkingT).norm;
    }
  }

  this.updateApple(z);

  var before = z.point();
  var changed = z.move(this.curves);
  this.checkForDeath(z, before, changed);
}

Game.prototype.checkForDeath = function(zier, before, changed) {
  var dead = Math.max(Math.abs(zier.point().x), Math.abs(zier.point().y)) > MAX_POS;
  var after = zier.point();
  var ii = changed ? this.curves.length - 1 : this.curves.length; 
  for (var i = 0; i < ii && !dead; ++i) {
    var c = this.curves[i];
    if (c.intersects(new Segment(before, after))) { dead = true; }
  }
  if (dead) {
    zier.died = this.numSteps;
  }
}

Game.prototype.updateApple = function(zier) {
  if (zier.point().vectorTo(this.apple).norm < APPLE_RADIUS) {
    var a = new Point(Math.random(), Math.random());
    this.score++;
    zier.speed = Math.min(zier.speed + SPEED_DELTA, MAX_SPEED);
    this.apple = new Point(Math.random()-0.5, Math.random()-0.5);
  }
}


Zier = function(start, destination) {
  var mid = new Segment(start, destination).midPoint();
  this.curve = new Curve(start, mid, destination);
  this.t = 0;  // How much of the current curve has been traversed
  this.speed = MIN_SPEED;  // How much curve length traversed per frame
  this.queue = [];  // Future curves
  this.trail = [];  // Curves traced in the past
  this.died = 0;
}

Zier.prototype.point = function() {
  return this.curve.point(this.t);
}

Zier.prototype.dead = function() {
  return this.died > 0;
}

Zier.prototype.lastCurve = function() {
  return this.queue.length == 0 ? this.curve : this.queue.slice(-1)[0];
}

Zier.prototype.nextControl = function(curve) {
  var endGradient = curve.gradient(1);
  var scale = 20 * this.speed;
  return curve.end.translate(endGradient.scaleTo(scale));
}

Zier.prototype.dummyCurve = function(curve) {
  var destination = this.nextControl(curve);
  var nextControl = new Segment(destination, curve.end).midPoint();
  return new Curve(curve.end, nextControl, destination);
}

// Returns whether or not a new curve was started
Zier.prototype.move = function(curves) {
  var changed = this.t == 0;
  this.t += Math.min(MAX_DELTA_T, this.speed / this.curve.gradient(this.t).norm);
  var before = this.point();
  if (this.t >= 1) {  // Select a new curve segment
    this.trail.push(this.curve);
    curves.push(this.curve);
    var dummy = this.dummyCurve(this.curve);
    this.curve = this.queue.length == 0 ? dummy : this.queue.shift();
    this.t = 0;
    return true;
  } else {
    return changed;
  }
}

/************
* Interface *
*************/

PATH_COLOR = "black";
QUEUE_COLOR = "gray";
MAX_ZOOM = MAX_POS*2.5;
FONT_HEIGHT = 20;

function Display(canvas, game) {
  this.canvas = canvas;
  this.game = game;
  this.context = canvas.getContext('2d');
  this.context.font = FONT_HEIGHT + "pt Arial";
  this.zoom = 1;  // Display width is one grid cell;
  this.autoZoom = true;
  this.focus = new Point(0, 0);
  this.agent = 0;  // Controlling zier 0
  this.mouseX = 0;
  this.mouseY = 0;
  this.zoomCounter = 0;
}

/**
 * Draws the current game state to the display
 */
Display.prototype.draw = function() {
  var z = this.game.ziers[0];
  if (z.dead()) { 
    var w = this.context.measureText("You have died!").width;
    this.context.fillText("You have died!", 
                          (this.canvas.width - w)/2,
                          (this.canvas.height - 10));
    return; 
  }

  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);  // Clear canvas

  // auto-zoom
  var p = z.point();
  var x = this.toX(p), y = this.toY(p);
  if (this.autoZoom) {
    if (x < 0 || x > this.canvas.width || y < 0 || y > this.canvas.height) {
      this.zoomCounter = 5;
    }
    if (this.zoomCounter > 0) {
      this.zoomCounter--;
      this.zoom *= 1.1;
    }
  }

  this.drawGrid();

  // Draw Zier
  var r = 10 / this.zoom
  drawShape(this.context, function(c) { drawCircle(c, x, y, r); }, "black");

  // Draw the current path and anchors
  this.drawCurve(z.curve.truncate(0, z.t), PATH_COLOR);
  this.drawCurve(z.curve.truncate(z.t, 1), QUEUE_COLOR);
  this.drawCircle(z.curve.end, QUEUE_COLOR);

  // Draw the queue of future destinations
  for (var i = 0, ii = z.queue.length; i < ii; ++i) {
    var c = z.queue[i];
    this.drawCurve(c, QUEUE_COLOR);
    this.drawCircle(c.end, QUEUE_COLOR);
  }

  // Draw past curves
  for (var i = 0, ii = this.game.curves.length; i < ii; ++i) {
    this.drawCurve(this.game.curves[i], "black");
  }

  // Draw the apple
  var ax = this.toX(this.game.apple), ay = this.toY(this.game.apple);
  drawShape(this.context, function(c) { drawCircle(c, ax, ay, r); }, "red");
  this.context.fillText("Score: " + this.game.score, 8, 8 + FONT_HEIGHT);

  // Draw the potential next curve and cursor
  var c = z.lastCurve();
  var mouse = this.toPoint(this.mouseX, this.mouseY);
  var next = new Curve(c.end, z.nextControl(c), mouse);
  var offset = 0.01 * (this.game.numSteps % 10 - 5);
  for (var k = offset; k < 1; k += 0.1) {
    var part = next.truncate(Math.max(0, k), Math.min(1, k + 0.05));
    this.drawCurve(part, QUEUE_COLOR);
  }
  if (this.game.numSteps % 10 > 5) {
    this.drawCircle(mouse, QUEUE_COLOR);
  }
}

Display.prototype.drawGrid = function() {
  for (var i = -MAX_POS; i <= MAX_POS; i += 0.25) {
    this.drawLine(new Point(-MAX_POS, i), new Point(MAX_POS, i), "LightGray");
    this.drawLine(new Point(i, -MAX_POS), new Point(i, MAX_POS), "LightGray"); 
  }
}

Display.prototype.drawCurve = function(curve, color, isTriangle) {
  var drawCmd = isTriangle ? drawTriangle : drawCurve;
  var disp = this;
  var drawFn = function(c) { drawCmd(c,
            disp.toX(curve.start), disp.toY(curve.start),
            disp.toX(curve.control), disp.toY(curve.control),
            disp.toX(curve.end), disp.toY(curve.end));
  };
  drawShape(this.context, drawFn, color, isTriangle);
}

Display.prototype.drawLine = function(p1, p2, color) {
  var p1x = this.toX(p1), p1y = this.toY(p1);
  var p2x = this.toX(p2), p2y = this.toY(p2);
  drawShape(this.context, function (c) { drawLine(c, p1x, p1y, p2x, p2y); }, color);
}
  
Display.prototype.drawCircle = function(p, color) {
  var x = this.toX(p), y = this.toY(p);
  var c = this.context;
  drawShape(this.context, function(c) { drawCircle(c, x, y, 3); }, color);
}

Display.prototype.mousemove = function(x, y) {
  this.mouseX = x;
  this.mouseY = y;
}

Display.prototype.click = function(x, y) {
  var z = this.game.ziers[this.agent];
  var c = z.lastCurve();
  z.queue.push(new Curve(c.end, z.nextControl(c), this.toPoint(x, y)));
}

Display.prototype.mousewheel = function(delta) {
  this.zoom = Math.min(MAX_ZOOM, Math.max(1, this.zoom - delta/3));
  this.autoZoom = false;
}


/************************
* Coordinate Conversion *
 ***********************/

Display.prototype.toPoint = function(x, y) {
  var minDim = Math.min(this.canvas.width, this.canvas.height);
  var xZoom = this.zoom * this.canvas.width / minDim;
  var yZoom = this.zoom * this.canvas.height / minDim;
  var xOffsetFromCenter = x / this.canvas.width - 0.5;
  var yOffsetFromCenter = y / this.canvas.height - 0.5;
  return new Point(xZoom * xOffsetFromCenter + this.focus.x, 
                   yZoom * yOffsetFromCenter + this.focus.y);
}

Display.prototype.toX = function(point) {
  var minDim = Math.min(this.canvas.width, this.canvas.height);
  var zoom = this.zoom * this.canvas.width / minDim;
  return ((point.x - this.focus.x)/ zoom + 0.5) * this.canvas.width;
}

Display.prototype.toY = function(point) {
  var minDim = Math.min(this.canvas.width, this.canvas.height);
  var zoom = this.zoom * this.canvas.height / minDim;
  return ((point.y - this.focus.y)/ zoom + 0.5) * this.canvas.height;
}


/*********
* Canvas *
**********/

function drawShape(context, drawFn, opt_color, opt_fill) {
  var color = opt_color ? opt_color : DEFAULT_STYLE; 
  if (opt_fill) {
    context.fillStyle = color;
    context.beginPath()
    drawFn(context);
    context.fill();
  } else {
    context.strokeStyle = color;
    context.beginPath()
    drawFn(context);
    context.stroke();
  }
}

function drawLine(context, x1, y1, x2, y2) {
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
}

function drawCurve(context, x1, y1, x2, y2, x3, y3) {
  context.moveTo(x1, y1);
  context.quadraticCurveTo(x2, y2, x3, y3);
}

function drawTriangle(context, x1, y1, x2, y2, x3, y3) {
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.lineTo(x3, y3);
  context.lineTo(x1, y1);
}

function drawCircle(context, x, y, r) {
  context.arc(x, y, r, 0, 2*Math.PI, false);
}


/*******
* Main *
********/

jQuery(document).ready(function() {
  var canvas = document.getElementById('canvas');
  var game = new Game(1);
  var display = new Display(canvas, game);

  // Mouse movements are routed to the display (view), which forwards them to
  // the game (model/controller) 
  $(canvas).mousemove(function(e) {
    var c = getMousePosition(e, canvas);
    display.mousemove(c.x, c.y);
  });
  $(canvas).click(function(e) {
    var c = getMousePosition(e, canvas);
    display.click(c.x, c.y);
  });
  $(document).mousewheel(function(e, delta, deltaX, deltaY) {
    display.mousewheel(delta);
  });

  // Start game loop
  var FPS = 30;  // Target frames per second
  setInterval(update, 1000 / FPS, game, display);
})

/**
 * Get mouse offset for an event relative to the top-left corner of an element
 */
function getMousePosition(event, element) {
  var offset = $(element).offset();
  var x = event.pageX - offset.left;
  var y = event.pageY - offset.top;
  return {x:x, y:y};
}

function update(game, display) {
  display.draw();
  game.step();
}
