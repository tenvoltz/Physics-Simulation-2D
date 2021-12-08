function RigidBody(args){
  this.shape = args.shape !== undefined ? args.shape : new Shape({});
  this.kinematic = args.kinematic !== undefined ? args.kinematic : new Kinematic({});
  this.material = args.material !== undefined ? args.material : new Material({});

  this.shape.getCentroid(this);
  this.shape.constructAABB(this);
  this.kinematic.calculateMass(this);
}
function Kinematic(args){
  this.center = args.center !== undefined ? args.center : new Vector();
  this.velocity = args.velocity !== undefined ? args.velocity : new Vector();
  this.acceleration = args.acceleration !== undefined ? args.acceleration : new Vector();
  this.angularPosition = args.angularPosition !== undefined ? args.angularPosition : 0;
  this.angularVelocity = args.angularVelocity !== undefined ? args.angularVelocity : 0;
  this.angularAcceleration = args.angularAcceleration !== undefined ? args.angularAcceleration : 0;
  this.force = args.force !== undefined ? args.force : new Vector(0,0);
  this.torque = args.torque !== undefined ? args.torque : 0;
}
function Material(args){
  this.density = args.density !== undefined ? args.density : 0.001; // g/cm^3
  this.restitution = args.restitution !== undefined ? Math.sqrt(args.restitution) : 1;
  this.kineticCoeffriction = args.kineticCoeffriction !== undefined ? args.kineticCoeffriction : 0.2;
  this.staticCoeffriction =  args.staticCoeffriction !== undefined ? args.staticCoeffriction : 0.5;
}
function Shape(){
  this.id = uniqueID();
}
function Circle(args){
  Shape.call(this);
  this.radius = args.radius !== undefined ? args.radius : 1;
}
function Polygon(args){
  Shape.call(this);
  Polygon.prototype = Object.create(Shape.prototype);
  this.vertices = args.vertices !== undefined ? args.vertices : [Vector.unitRandom(), Vector.unitRandom(), Vector.unitRandom()];

  this.sortVertices();
}
Kinematic.prototype.calculateMass = function(rigidBody){
  this.mass = rigidBody.material.density * rigidBody.shape.area;
  this.massInverse = this.mass !== 0 ? 1/this.mass : 0;

  let aabb = rigidBody.shape.aabb;
  let width = aabb.getDimension().x;
  let height = aabb.getDimension().y;
  this.momentOfInertia = this.mass*(width*width + height*height)/12;
  this.momentOfInertiaInverse = this.momentOfInertia !== 0 ? 1/this.momentOfInertia : 0;
};
Kinematic.prototype.move = function(rigidBody, timeStep){
  //Verlet Integration
  if(this.mass == 0) return;
  //s' = s + vt + 1/2 * a * t^2
  let newCenter = this.center.add(this.velocity.scale(timeStep)).add(this.acceleration.scale(0.5*timeStep*timeStep));
  //0' = 0 + wt + 1/2 * w * t^2
  let newAngularPosition = this.angularPosition + this.angularVelocity * timeStep + 0.5 * this.angularAcceleration * timeStep*timeStep;

  this.applyForce();
  this.applyTorque();

  //a' = F / m
  let newAcceleration = this.force.scale(this.massInverse);
  //a' = T / I
  let newAngularAcceleration = this.torque*this.momentofInertiaInverse;

  //v'= v + t(a + a')/2
  let newVelocity = this.velocity.add((this.acceleration.add(newAcceleration)).scale(0.5*timeStep));
  //w' = w + t(a + a')/2
  let newAngularVelocity = this.angularVelocity + (this.angularAcceleration + newAngularAcceleration)*0.5*timeStep;

  this.center = newCenter;
  this.velocity = newVelocity;
  this.acceleration = newAcceleration;

  this.angularPosition = newAngularPosition;
  this.angularVelocity = newAngularVelocity;
  this.angularAcceleration = newAngularAcceleration;
  
  rigidBody.shape.constructAABB(rigidBody);
};
Kinematic.prototype.applyForce = function(){
  this.force = new Vector();
  this.force = this.force.add((new Vector(0, -9.81)).scale(this.mass)); //Gravity
};
Kinematic.prototype.applyTorque = function(){};
Circle.prototype.getCentroid = function(rigidBody){
  this.area = Math.PI*rigidBody.shape.radius*rigidBody.shape.radius;
};
Circle.prototype.constructAABB = function(rigidBody){
  let min = new Vector(rigidBody.kinematic.center.x - this.radius, rigidBody.kinematic.center.y - this.radius);
  let max = new Vector(rigidBody.kinematic.center.x + this.radius, rigidBody.kinematic.center.y + this.radius);
  this.aabb = new AABB(min, max);
};
Circle.prototype.draw = function(rigidBody, ctx, lineWidth = 2, strokeStyle = 'orange'){
  ctx.beginPath();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeStyle;
  ctx.arc(rigidBody.kinematic.center.x, rigidBody.kinematic.center.y, rigidBody.shape.radius, 0, 2*Math.PI);
  ctx.stroke();
  ctx.closePath();
  //this.aabb.draw(this.id, ctx);
}
Polygon.prototype.getCentroid = function(rigidBody){
  let vertices = rigidBody.shape.vertices;
  let centroid = new Vector();
  let area = 0;
  let currentVertex = new Vector();
  let nextVertex = new Vector();
  let partialArea = 0;
  let i = 0
  for(i = 0; i < vertices.length - 1; ++i){
    currentVertex = vertices[i];
    nextVertex = vertices[i+1];
    partialArea = currentVertex.cross(nextVertex);
    area += partialArea;
    centroid = centroid.add((currentVertex.add(nextVertex)).scale(partialArea));
  }
  currentVertex = vertices[i];
  nextVertex = vertices[0];
  partialArea = currentVertex.cross(nextVertex);
  area += partialArea;
  centroid = centroid.add((currentVertex.add(nextVertex)).scale(partialArea));
  
  area *= 0.5;
  centroid = centroid.scale(1/(6*area))
  this.area = Math.abs(area);
  rigidBody.kinematic.center = centroid;
};
Polygon.prototype.constructAABB = function(rigidBody){
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.POSITIVE_INFINITY;
  this.vertices.forEach(function(vertex){
    if(vertex.x < minX) minX = vertex.x;
    if(vertex.y < minY) minY = vertex.y;
    if(vertex.x > maxX) maxX = vertex.x;
    if(vertex.y > maxY) maxY = vertex.y;
  });
  this.aabb = new AABB(new Vector(minX, minY), 
                       new Vector(maxX, maxY));
};
Polygon.prototype.sortVertices = function(){
  let verticesMean = new Vector();
  this.vertices.forEach(vertex => verticesMean.add(vertex))
  verticesMean.scale(1/this.vertices.length);
  this.vertices.sort(function clockwiseSort(firstVertex, secondVertex){
    let firstToCenter = firstVertex.subtract(verticesMean);
    let secondToCenter = secondVertex.subtract(verticesMean);
    return Math.atan2(secondToCenter.y, secondToCenter.x) - Math.atan2(firstToCenter.y, firstToCenter.x);
  });
};
Polygon.prototype.getSupport = function(direction){
  let maxProjectionAlongDirection = Number.NEGATIVE_INFINITY;
  let supportVertex;
  this.vertices.forEach(function(vertex){
    let projectionAlongDirection = vertex.dot(direction);
    if(projectionAlongDirection > maxProjectionAlongDirection){
      maxProjectionAlongDirection = projectionAlongDirection;
      supportVertex = vertex;
    }
  });
  return supportVertex;
};
Polygon.getAxisOfLeastPenetration = function(polygonOne, polygonTwo){
  
};
let materials =  {
  "wood": new Material({density: 0.0066, restitution: 0.5, kineticCoeffriction: 0.3, staticCoeffriction: 0.2}),
  "steel": new Material({density: 0.0805, restitution: 0.56, kineticCoeffriction: 0.6, staticCoeffriction: 0.3}),
  "glass": new Material({density: 0.025, restitution: 0.9, kineticCoeffriction: 0.9, staticCoeffriction:0.4}),
  "staticGlass": new Material({density: 0, restitution: 0.9, kineticCoeffriction: 0.9, staticCoeffriction:0.4}),
  "ice": new Material({density: 0.009, restitution: 0.88, kineticCoeffriction: 0.1, staticCoeffriction: 0.01}),
  "staticIce": new Material({density: 0, restitution: 0.88, kineticCoeffriction: 0.1, staticCoeffriction: 0.01})
};
let uniqueID = (function(){
  let id = 0;
  return function(){
    return id++; 
  };
})();

/*
function Rectangle(center = new Vector(0,0), dimension = new Vector(1,1), mass, resitution){
  Shape.call(this, center, mass, resitution);
  this.dimension = dimension;
  this.aabb = AABB.generate.call(this);
  this.draw = function(ctx, lineWidth = 2, strokeStyle = 'orange'){
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.strokeRect(this.center.x - this.dimension.x*0.5, this.center.y - this.dimension.y*0.5, this.dimension.x, this.dimension.y);
    ctx.stroke();
    ctx.closePath();
    //this.aabb.draw(this.id, ctx, lineWidth, strokeStyle);
  }
}
function Circle(center, radius = 1, mass, resitution){
  Shape.call(this, center, mass, resitution);
  this.radius = radius;
  //this.velocity = new Vector(10,30);
  this.aabb = AABB.generate.call(this);
  this.draw = function(ctx, lineWidth = 2, strokeStyle = 'orange'){
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.arc(this.center.x, this.center.y, this.radius, 0, 2*Math.PI);
    ctx.stroke();
    ctx.closePath();
    //this.aabb.draw(this.id, ctx);
  }
}
*/