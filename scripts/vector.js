'use strict';

function Vector(x = 0,y = 0){
  this.x = x;
  this.y = y;
}
Vector.prototype.clone = function(){
    return new Vector(this.x,  this.y);
};
Vector.prototype.negate = function(){
    return new Vector(-this.x,  -this.y);
};
Vector.prototype.perpendicular = function(){
    //rotate right ; but turn left under current ctx
    return new Vector(this.y, -this.x);
};
Vector.prototype.perpendicular2 = function(){
    //rotate left ; but turn right under current ctx
    return new Vector(-this.y, this.x);
};
Vector.prototype.add = function(other){
    return new Vector(
      this.x + other.x,
      this.y + other.y
    );
};

Vector.prototype.subtract = function(other){
    return new Vector(
      this.x - other.x,
      this.y - other.y
    );
};
Vector.prototype.multiply= function(other){
    return new Vector(
      this.x * other.x,
      this.y * other.y
    );
};
Vector.prototype.divide = function(other){
    return new Vector(
      this.x / other.x,
      this.y / other.y
    );
};
Vector.prototype.dot = function(other){
    return this.x * other.x + this.y * other.y;
};
Vector.prototype.cross = function(other){
    return this.x * other.y - this.y * other.x;
};
Vector.prototype.crossScalar = function(scalar){
    //vector cross scalar
    return new Vector(scalar * this.y, -scalar * this.x);
};
Vector.prototype.scalarCross = function(scalar){
    //scalar cross vector
    return new Vector(-scalar * this.y, scalar * this.x);
};
Vector.prototype.equals = function(other){
    return this.x == other.x && this.y == other.y;
};
Vector.prototype.scale = function(value){
    return new Vector(
      this.x * value,
      this.y * value
    );
};
Vector.prototype.sqrLength = function(){
    return this.x * this.x + this.y * this.y;
};
Vector.prototype.length = function(){
    return Math.sqrt(this.sqrLength());
};
Vector.prototype.normalize = function(){
    return this.scale(1/this.length());
};
  
Vector.prototype.setComponent = function(x,y){
    this.x = x;
    this.y = y;
};

Vector.prototype.draw = function(ctx, origin = new Vector(0,0), lineWidth = 2, strokeStyle = 'black'){
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(origin.x + this.x, origin.y + this.y);
    ctx.stroke();
    ctx.moveTo(origin.x, origin.y);
    ctx.arc(origin.x + this.x, origin.y + this.y, lineWidth*2, 0, 2*Math.PI);
    ctx.fill();
    ctx.closePath();
};

Vector.unitRandom = function(){
    let v;
    do{
      v = new Vector(Math.random()*2-1, Math.random()*2-1);
    }
    while(v.sqrLength > 1);
    return v;
};
