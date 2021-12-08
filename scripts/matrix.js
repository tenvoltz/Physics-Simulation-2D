function Matrix(xRow = new Vector(1, 0), yRow = new Vector(0,1)){
  this.xRow = xRow;
  this.yRow = yRow;

  this.extractInfo();
}
Matrix.prototype.extractInfo = function(){
  this.x0 = this.xRow.x;
  this.x1 = this.xRow.y;
  this.y0 = this.yRow.x;
  this.y1 = this.yRow.y;
};
Matrix.prototype.clone = function(){
  return new Matrix(this.xRow, this.yRow);
}
Matrix.prototype.add = function(other){
  return new Matrix(this.xRow.add(other.xRow), 
                    this.yRow.add(other.yRow));
};
Matrix.prototype.subtract = function(other){
  return new Matrix(this.xRow.subtract(other.xRow), 
                    this.yRow.subtract(other.yRow));
};
Matrix.prototype.multiplyVector = function(other){
  return new Vector(this.xRow.dot(other), 
                    this.yRow.dot(other));
};
Matrix.prototype.multiplyMatrix = function(other){
  transposed = other.transpose();
  return (new Matrix(this.multiplyVector(transposed.xRow), 
                     this.multiplyVector(transposed.yRow))).transpose();
};
Matrix.prototype.scale = function(value){
  return new Matrix(this.xRow.scale(value), 
                    this.yRow.scale(value));
};
Matrix.prototype.transpose = function(){
  return new Matrix(new Vector(this.x0, this.y0), 
                    new Vector(this.x1, this.y1));
};
Matrix.rotation = function(angle){
  cos = Math.cos(angle);
  sin = Math.sin(angle);
  rotation = new Matrix(new Vector(cos, -sin), 
                        new Vector(sin,  cos));
  if(angle < 0) rotation = rotation.transpose();
  return rotation;
}
Vector.prototype.rotate = function(angle){
  return (Matrix.rotation(angle)).multiplyVector(this);
}