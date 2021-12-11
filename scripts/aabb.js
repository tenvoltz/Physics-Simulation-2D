function AABB(min = new Vector(0,0), max = new Vector(1,1)){
  this.min = min;
  this.max = max;
  this.dimension = this.getDimension();
  this.draw = function(id, ctx, lineWidth = 1, strokeStyle = 'blue'){
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.strokeRect(this.min.x, this.min.y, this.dimension.x, this.dimension.y);

    ctx.font = Math.round(Math.min((this.dimension.x),(this.dimension.y)) * 0.5) + 'px serif';
    let center = this.min.add(this.dimension.scale(0.5));
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
AABB.prototype.getDimension = function(){
  return this.max.subtract(this.min);
}
