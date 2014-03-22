//@module

var Maze = function(cols, rows) {
  this._cols = cols;
  this._rows = rows;
  this._wallsV = [];
  for (var x = 0; x <= cols; x++) {
    this._wallsV[x] = [];
    for (var y = 0; y < rows; y++) {
      this._wallsV[x][y] = false;
    }
  }
  this._wallsH = [];
  for (var x = 0; x < cols; x++) {
    this._wallsH[x] = [];
    for (var y = 0; y <= rows; y++) {
      this._wallsH[x][y] = false;
    }
  }
};
Maze.VERTICAL = 0;
Maze.HORIZONTAL = 1;
Maze.prototype.setPassable = function(wall, passable) {
  switch (wall.type) {
    case Maze.VERTICAL:
      this._wallsV[wall.x][wall.y] = passable;
      break;
    case Maze.HORIZONTAL:
      this._wallsH[wall.x][wall.y] = passable;
      break;
  }
};
Maze.prototype.isPassable = function(wall) {
  switch (wall.type) {
    case Maze.VERTICAL:
      return this._wallsV[wall.x][wall.y];
    case Maze.HORIZONTAL:
      return this._wallsH[wall.x][wall.y];
  }
};
Maze.prototype.getCellNeighbors = function(cell) {
  var N = [];
  if (cell.x > 0) {
    N.push({
      type: Maze.VERTICAL,
      x: cell.x,
      y: cell.y
    });
  }
  if (cell.x < this._cols - 1) {
    N.push({
      type: Maze.VERTICAL,
      x: cell.x + 1,
      y: cell.y
    });
  }
  if (cell.y > 0) {
    N.push({
      type: Maze.HORIZONTAL,
      x: cell.x,
      y: cell.y
    });
  }
  if (cell.y < this._rows - 1) {
    N.push({
      type: Maze.HORIZONTAL,
      x: cell.x,
      y: cell.y + 1
    });
  }
  return N;
};
Maze.prototype.getUnpassableCellNeighbors = function(cell) {
  var N = this.getCellNeighbors(cell);
  var unpassable = [];
  for (var i = 0; i < N.length; i++) {
    var wall = N[i];
    if (!this.isPassable(wall)) {
      unpassable.push(wall);
    }
  }
  return unpassable;
};
Maze.prototype.getWallNeighbors = function(wall) {
  switch (wall.type) {
    case Maze.VERTICAL:
      return [
        {x: wall.x - 1, y: wall.y},
        {x: wall.x, y: wall.y}
      ];
    case Maze.HORIZONTAL:
      return [
        {x: wall.x, y: wall.y - 1},
        {x: wall.x, y: wall.y}
      ];
  }
};
Maze.prototype.draw = function(canvas, ctx, startCell, finishCell, pad) {
  var w = canvas.width;
  var h = canvas.height;
  var cw = w / this._cols;
  var ch = h / this._rows;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#fff';
  for (var x = 0; x < this._cols; x++) {
    for (var y = 0; y < this._rows; y++) {
      ctx.fillRect(
          cw * x + pad, ch * y + pad,
          cw - 2 * pad, ch - 2 * pad);
    }
  } 
  ctx.fillStyle = '#f00';
  ctx.fillRect(
        cw * startCell.x + pad, ch * startCell.y + pad,
        cw - 2 * pad, ch - 2 * pad);
  ctx.fillStyle = '#0f0';
  ctx.fillRect(
        cw * finishCell.x + pad, ch * finishCell.y + pad,
        cw - 2 * pad, ch - 2 * pad);
  ctx.fillStyle = '#fff';
  for (var x = 0; x <= this._cols; x++) {
    for (var y = 0; y < this._rows; y++) {
      var wall = {
        type: Maze.VERTICAL,
        x: x,
        y: y
      };
      if (this.isPassable(wall)) {
        ctx.fillRect(
            cw * x - pad, ch * y + pad,
            2 * pad, ch - 2 * pad);
      }
    }
  }
  for (var x = 0; x < this._cols; x++) {
    for (var y = 0; y <= this._rows; y++) {
      var wall = {
        type: Maze.HORIZONTAL,
        x: x,
        y: y
      };
      if (this.isPassable(wall)) {
        ctx.fillRect(
            cw * x + pad, ch * y - pad,
            cw - 2 * pad, 2 * pad);
      }
    }
  }
};
Maze.prototype.pointInCell = function(canvas, pad, p, cell) {
  var w = canvas.width;
  var h = canvas.height;
  var cw = w / this._cols;
  var ch = h / this._rows;
  if (p.x < (cw * cell.x + pad)) {
    return false;
  }
  if (p.x > (cw * (cell.x + 1) - pad)) {
    return false;
  }
  if (p.y < (ch * cell.y + pad)) {
    return false;
  }
  if (p.y > (ch * (cell.y + 1) - pad)) {
    return false;
  }
  return true;
};
Maze.prototype.pointHitsWall = function(canvas, pad, p) {
  var w = canvas.width;
  var h = canvas.height;
  var cw = w / this._cols;
  var ch = h / this._rows;
  
  var c = {
    x: Math.floor(p.x / cw),
    y: Math.floor(p.y / ch)
  };
  var d = {
    x: p.x - c.x * cw,
    y: p.y - c.y * ch
  };
  var outcode = 0x0;
  if (d.x < pad) {
    outcode |= 0x1;
  } else if (d.x > cw - pad) {
    outcode |= 0x2;
  }
  if (d.y < pad) {
    outcode |= 0x4;
  } else if (d.y > ch - pad) {
    outcode |= 0x8;
  }
  switch (outcode) {
  case 0x0:
    return false;
  case 0x5:
  case 0x6:
  case 0x9:
  case 0xa:
    return true;
  case 0x1:
    return (c.x === 0) || !this._wallsV[c.x][c.y];
  case 0x2:
    return (c.x === this._cols - 1) || !this._wallsV[c.x + 1][c.y];
  case 0x4:
    return (c.y === 0) || !this._wallsH[c.x][c.y];
  case 0x8:
    return (c.y === this._rows - 1) || !this._wallsH[c.x][c.y + 1];
  default:
    throw new Error('invalid outcode');
  }
};
Maze._getOppositeCell = function(cellNeighbors, cells) {
  for (var i = 0; i < cellNeighbors.length; i++) {
    var cell = cellNeighbors[i];
    if (!cells[cell.x][cell.y]) {
      return cell;
    }
  }
  return null;
};
Maze.generate = function(cols, rows, startCell) {
  var maze = new Maze(cols, rows);
  var cells = [];
  for (var x = 0; x < cols; x++) {
    cells[x] = [];
    for (var y = 0; y < rows; y++) {
      cells[x][y] = false;
    }
  }
  cells[startCell.x][startCell.y] = true;
  var wallQueue = maze.getCellNeighbors(startCell);
  while (wallQueue.length > 0) {
    // pick a random wall
    var i = Math.floor(Math.random() * wallQueue.length);
    var wall = wallQueue[i];
    wallQueue.splice(i, 1);
    // figure out which side of wall is not yet in maze
    var cellNeighbors = maze.getWallNeighbors(wall);
    var oppositeCell = Maze._getOppositeCell(cellNeighbors, cells);
    if (oppositeCell !== null) {
      cells[oppositeCell.x][oppositeCell.y] = true;
      maze.setPassable(wall, true);
      var N = maze.getUnpassableCellNeighbors(oppositeCell);
      wallQueue.push.apply(wallQueue, N);
    }
  }
  return maze;
};

module.exports = Maze;
