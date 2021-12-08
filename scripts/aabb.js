function AABB(min = new Vector(0,0), max = new Vector(1,1)){
  this.min = min;
  this.max = max;
  this.draw = function(id, ctx, lineWidth = 1, strokeStyle = 'blue'){
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.strokeRect(this.min.x, this.min.y, this.max.x-this.min.x, this.max.y-this.min.y);
    ctx.font = Math.round(Math.min((this.max.x - this.min.x),(this.max.y - this.min.y)) * 0.5) + 'px serif';
    let center = this.max.subtract(this.min).scale(0.5).add(this.min);
    ctx.save();
    ctx.scale(1, -1);
    ctx.translate(0, -canvas.height); 
    ctx.fillStyle = "cyan";
    ctx.fillText(id, center.x, canvas.height-center.y);
    ctx.restore();
    ctx.stroke();
    ctx.closePath();
  }
}
AABB.prototype.intersect = function(other){
  if(this.max.x < other.min.x || this.min.x > other.max.x)
    return false;
  if(this.max.y < other.min.y || this.min.y > other.max.y)
    return false;
  return true;
};
AABB.generate = function(){
  if(this instanceof Circle){
    let min = new Vector(this.center.x - this.radius, this.center.y - this.radius);
    let max = new Vector(this.center.x + this.radius, this.center.y + this.radius);
    return new AABB(min, max);
  }
  if(this instanceof Rectangle){
    let min = new Vector(this.center.x - this.dimension.x*0.5, this.center.y - this.dimension.y*0.5);
    let max = new Vector(this.center.x + this.dimension.x*0.5, this.center.y + this.dimension.y*0.5);
    return new AABB(min, max);
  }
}
