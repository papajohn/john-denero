// Geometry library

var EQ_TOL = 1e-5  // Tolerance for testing numeric equality

leq = function(x, y) {
  if (x <= y) { return true; }
  return x <= y + Math.max(Math.abs(x), Math.abs(y), EQ_TOL) * EQ_TOL;
}

eq = function(x, y) {
  if (x == y) { return true; }
  return leq(x,y) && leq(y,x);
}

/**
 * A point in game space (absolute position)
 */
Point = function(x, y) {
  this.x = x;
  this.y = y;
}

Point.prototype.vectorTo = function(other) {
  return new Vector(other.x - this.x, other.y - this.y);
}

Point.prototype.distTo = function(other) {
  return this.vectorTo(other).norm;
}

Point.prototype.translate = function(vec) {
  return new Point(this.x + vec.dx, this.y + vec.dy);
}

Point.prototype.toString = function() {
  return '(' + this.x + ',' + this.y + ')';
}

/**
 * A vector in game space (change in position)
 */
Vector = function(dx, dy) {
  this.dx = dx;
  this.dy = dy;
  this.norm = Math.sqrt(dx * dx + dy * dy);
}

Vector.prototype.scaleBy = function(scale) {
  return new Vector(this.dx * scale, this.dy * scale);
}

Vector.prototype.scaleTo = function(norm) {
  return new Vector(this.dx / this.norm * norm, this.dy / this.norm * norm);
}

Vector.prototype.dot = function(other) {
  return this.dx * other.dx + this.dy * other.dy;
}

Vector.prototype.parallelTo = function(other) {
  return eq(0,  other.dy * this.dx - this.dy * other.dx);
}


/**
 * A line defined by p = start + t * direction
 */
Line = function(start, dir) {
  this.start = start;
  this.dir = dir;
}

// Returns point of intersection, or the midpoint if this does not intersect other
//
// Define lines as A x + B y = C, or 
//   (dir.dy) x + (-dir.dx) y = (dir.dy * start.x - dir.dx * start.y)
// Then, we can solve the system of equations in x & y defined by two lines.
Line.prototype.intersect = function(other) {
  var a1 = this.dir.dy;
  var a2 = other.dir.dy;
  var b1 = -this.dir.dx;
  var b2 = -other.dir.dx;
  var c1 = a1 * this.start.x + b1 * this.start.y;
  var c2 = a2 * other.start.x + b2 * other.start.y;

  var det = a1 * b2 - a2 * b1;
  if(eq(0, det)) {
    return new Segment(this.start, other.start).midPoint();
  } else {
    return new Point((b2*c1 - b1*c2)/det, 
                     (a1*c2 - a2*c1)/det);
  }
}


/**
 * A line segment defined by p = start + t * (end - start) : 0 <= t <= 1
 */
Segment = function(start, end) {
  this.start = start;
  this.end = end;
  this.dir= start.vectorTo(end);
}

Segment.prototype.midPoint = function() {
  return this.start.translate(this.dir.scaleBy(0.5));
}

// Returns true if this intersects other segment
Segment.prototype.intersects = function(other) {
  if (eq(other.norm(), 0)) { return false; }

  // Fast check on x only
  var lowerX = this.dir.dx > 0 ? this.start.x : this.end.x;
  var upperX = this.dir.dx > 0 ? this.end.x : this.start.x;
  if (other.dir.dx > 0) {
    if (other.end.x < lowerX || other.start.x > upperX) { return false; }
  } else {
    if (other.start.x < lowerX || other.end.x > upperX) { return false; }
  }

  // Fast check on y only
  var lowerY = this.dir.dy > 0 ? this.start.y : this.end.y;
  var upperY = this.dir.dy > 0 ? this.end.y : this.start.y;
  if (other.dir.dy > 0) {
    if (other.end.y < lowerY || other.start.y > upperY) { return false; }
  } else {
    if (other.start.y < lowerY || other.end.y > upperY) { return false; }
  }

  // Thorough check
  var cx = this.start.x - other.start.x;
  var cy = this.start.y - other.start.y;
  var d = - other.dir.dy * cx + other.dir.dx * cy;
  var e = this.dir.dx * cy - this.dir.dy * cx;
  var f = - this.dir.dy * other.dir.dx + this.dir.dx * other.dir.dy;
  if (f > 0) {
    if (d < 0 || d > f) { return false; }
    if (e < 0 || e > f) { return false; }
  } else {
    if (d > 0 || d < f) { return false; }
    if (e > 0 || e < f) { return false; }
  }
  return true;
}

// Returns the length of the segment
Segment.prototype.norm = function() {
  return this.dir.norm;
}


/**
 * A quadratic bezier curve defined by three points
 */
Curve = function(start, control, end) {
  this.start = start;
  this.control = control;
  this.end = end;
}

Curve.prototype.point = function(t) {
  var x = (1-t)*(1-t)*this.start.x + 2*t*(1-t)*this.control.x + t*t*this.end.x;
  var y = (1-t)*(1-t)*this.start.y + 2*t*(1-t)*this.control.y + t*t*this.end.y;
  return new Point(x, y);
}

Curve.prototype.gradient = function(t) {
  var dx = -2 * (1-t) * this.start.x + (2 - 4*t) * this.control.x + 2 * t * this.end.x;
  var dy = -2 * (1-t) * this.start.y + (2 - 4*t) * this.control.y + 2 * t * this.end.y;
  return new Vector(dx, dy);
}

/**
 * Truncates a curve to start at curve.point(t1) and end at curve.point(t2)
 */
Curve.prototype.truncate = function(t1, t2) {
  var start = this.point(t1);
  var end = this.point(t2);
  var control;
  if (this.isLineSegment()) {
    control = new Segment(start, end).midPoint();
  } else {
    var startGradient = this.gradient(t1);
    var endGradient = this.gradient(t2).scaleBy(-1);
    control = new Line(start, startGradient).intersect(new Line(end, endGradient));
  }
  return new Curve(start, control, end);
}

/**
 * True if this is a line
 */
Curve.prototype.isLineSegment = function() {
  return this.start.vectorTo(this.end).parallelTo(this.start.vectorTo(this.control));
}

// Returns true if the (start, control, end) triangle contains point
Curve.prototype.triangleContains = function(point) {
  if (this.isLineSegment()) { return; }

  var v0 = this.start.vectorTo(this.control);
  var v1 = this.start.vectorTo(this.end);
  var v2 = this.start.vectorTo(point);

  var dot00 = v0.dot(v0);
  var dot01 = v0.dot(v1);
  var dot02 = v0.dot(v2);
  var dot11 = v1.dot(v1);
  var dot12 = v1.dot(v2);

  // Compute barycentric coordinates
  var invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
  var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
  var v = (dot00 * dot12 - dot01 * dot02) * invDenom;

  // Check if point is in triangle
  return (u > 0) && (v > 0) && (u + v < 1);
}

/**
 * True if this intersects the ray a->b
 * 
 * Given points (s, c, e, g, h), find scalars (t, u) such that:
 *   (1-2t+t*t)s + (t-t*t)c + (t*t)e = g + (u)(h-g)
 *
 * Let  v = u * (b-a).x
 *      d = (h-g).y / (h-g).x
 *
 * Then (1-2t+t*t)s.x + 2(t-t*t)c.x + (t*t)e.x = g.x + v
 *      (1-2t+t*t)s.y + 2(t-t*t)c.y + (t*t)e.y = g.y + d * v
 *      (1-2t+t*t)s.y + 2(t-t*t)c.y + (t*t)e.y = g.y + d((1-2t+t*t)s.x + 2(t-t*t)c.x + (t*t)e.x - g.x)
 * 
 * Solving for t, we have
 *      (s.y-2c.y+e.y-d*(s.x-2c.x+e.x)) * t^2 
 *        + (-2s.y+2c.y-d(-2s.x+2c.x)) * t 
 *        + (s.y-g.y-d(s.x-g.x)) = 0
 */
Curve.prototype.intersects = function(segment) {
  // Special cases
  if (eq(segment.norm(), 0)) {
    return false;
  }
  if (this.isLineSegment()) {
    return new Segment(this.start, this.end).intersects(segment);
  }

  // Define quadratic formula
  var g = segment.start;
  var h = segment.end;
  var hg = segment.dir;
  var s = this.start, n = this.control, e = this.end;
  var a, b, c;
  if (eq(hg.dx, 0)) {
    a = s.x-2*n.x+e.x;
    b = -2*s.x+2*n.x;
    c = s.x-g.x; 
  } else {
    d = hg.dy / hg.dx;
    a = s.y-2*n.y+e.y-d*(s.x-2*n.x+e.x);
    b = -2*s.y+2*n.y-d*(-2*s.x+2*n.x);
    c = s.y-g.y-d*(s.x-g.x);
  }
  
  // Apply the quadratic equation
  var t1 = (-b + Math.sqrt(b*b - 4*a*c))/(2*a);
  var t2 = (-b - Math.sqrt(b*b - 4*a*c))/(2*a);
  if (isNaN(t1)) { return false; }
  
  for (var i = 0; i < 2; ++i) {
    var t = (i == 0) ? t1 : t2;
    if (t < 0 || t > 1) { continue; }
    var p = this.point(t); 
    var pg = g.vectorTo(p);
    var dot = pg.dot(hg) / (hg.norm * hg.norm);
    if (0 < dot && dot < 1) {
      return true;
    }
  }
  return false;
}


/********************
* Testing interface *
********************/

var POINT_RADIUS = 0.04;

/**
 * Draws a manipulatable region from [-1,1] in x and y dimensions
 */
TestUI = function(canvas) {
  this.canvas = document.getElementById('canvas');
  var p1 = new Point(-0.2,-0.7);
  var p2 = new Point(-0.2,0.3);
  var p3 = new Point(-0.3, -0.3);
  var p4 = new Point(-0.4, -0.4);
  var p5 = new Point(0, -0.6);
  var p6 = new Point(-0.8, 0 );
  var p7 = new Point(-0.8, 0.2 );
  var p8 = new Point(-0.8, 0.4 );
  this.points = [p1, p2, p3, p4, p5, p6, p7, p8];
  this.segments = [new Segment(p1, p2)];
  this.curves = [new Curve(p3, p4, p5), new Curve(p6, p7, p8)];
  this.movingPoint = null;

  var ui = this;
  }

TestUI.prototype.update = function() {
  var context = this.canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);  // Clear canvas

  // Draw points
  for (var i = 0, ii = this.points.length; i < ii; ++i) {
    var p = this.points[i];
    context.strokeStyle = 'black';
    context.beginPath();
    context.arc(this.toX(p), this.toY(p), 
                POINT_RADIUS * this.canvas.width / 2, 
                0, 2*Math.PI, false);
    context.stroke();
  }

  // Draw segments
  for (var i = 0, ii = this.segments.length; i < ii; ++i) {
    var s = this.segments[i];
    s.dir = s.start.vectorTo(s.end);
    
    // Check for intersections with curves
    var inter = false;
    for (var j = 0, jj = this.curves.length; j < jj && !inter; ++j) {
      if (this.curves[j].intersects(s)) {
        inter = true;
      }
    }

    context.strokeStyle = inter ? 'red' : 'green';
    context.beginPath();
    context.moveTo(this.toX(s.start), this.toY(s.start));
    context.lineTo(this.toX(s.end), this.toY(s.end));
    context.stroke();
  }

  // Draw curves
  for (var i = 0, ii = this.curves.length; i < ii; ++i) {
    var c = this.curves[i];

    // Check for intersections with lines
    var inter = false;
    for (var j = 0, jj = this.segments.length; j < jj && !inter; ++j) {
      if (c.intersects(this.segments[j])) {
        inter = true;
      }
    }

    context.strokeStyle = inter ? 'red' : 'green';
    context.beginPath();
    context.moveTo(this.toX(c.start), this.toY(c.start));
    context.quadraticCurveTo(this.toX(c.control), this.toY(c.control),
                             this.toX(c.end), this.toY(c.end));
    context.stroke();
  }
}

TestUI.prototype.toX = function(p) {
  return (p.x + 1) * this.canvas.width / 2;
}

TestUI.prototype.toY = function(p) {
  return (p.y + 1) * this.canvas.height / 2;
}


// Point of the event mouse position
TestUI.prototype.getPoint = function(event) {
  var offset = $(this.canvas).offset();
  var x = event.pageX - offset.left;
  var y = event.pageY - offset.top;
  return new Point(x / this.canvas.width * 2 - 1, 
                   y / this.canvas.height * 2 - 1);
}

// Uncomment to run the test UI
// jQuery(document).ready(function() {
//   var ui = new TestUI();
// 
//   $(canvas).mousedown(function(e) {
//     var p = ui.getPoint(e);
//     for (var i = 0, ii = ui.points.length; i < ii; ++i) {
//       if (p.vectorTo(ui.points[i]).norm < POINT_RADIUS) {
//         ui.movingPoint = ui.points[i];
//       }
//     }
//   });
// 
//   $(canvas).mouseup(function(e) {
//     ui.movingPoint = null;
//   });
// 
//   $(canvas).mousemove(function(e) {
//     if (ui.movingPoint != null) {
//       var p = ui.getPoint(e);
//       ui.movingPoint.x = p.x;
//       ui.movingPoint.y = p.y;
//     }
//   });
// 
//   setInterval(function() { ui.update(); }, 30);
// });
