function Kinematic(center = new Vector(0,0), 
                   velocity = new Vector(0,0), 
                   acceleration = new Vector(0,0),
                   mass = 1,
                   material = materials.ice){
  this.id = uniqueID();
  this.center = center;
  this.velocity = velocity;
  this.acceleration = acceleration;
  this.mass = mass;
  this.massInverse = mass == 0 ? 0 : 1.0/mass;
  this.material = material;
  

  this.move = function(timeStep){
    //Velocity Verlet
    if(this.mass == 0) return;
    let newCenter = this.center.add(this.velocity.scale(timeStep)).add(this.acceleration.scale(0.5*timeStep*timeStep));
    let newAcceleration = this.accelerate();
    let newVelocity = this.velocity.add(this.acceleration.add(newAcceleration).scale(0.5*timeStep));
    this.center = newCenter;
    this.velocity = newVelocity;
    this.acceleration = newAcceleration;
    this.aabb = AABB.generate.call(this);

  }

  this.accelerate = function(){
    let gravity = new Vector(0, -9.81);
    return gravity;
  }
}

function Shape(center, mass, resitution){
  Kinematic.call(this, center, undefined, undefined, mass, resitution);
  this.aabb = new AABB();
}
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

function Material(density = 1, restitution = 1, kineticCoeffriction = 0.5, staticCoeffriction = 0.75){
  this.density = density; // g/cm^3
  this.restitution = Math.sqrt(restitution);
  this.kineticCoeffriction = kineticCoeffriction;
  this.staticCoeffriction = staticCoeffriction;
}

function RigidBody(shape, kinematic, material){
  this.shape = shape;
  this.kinematic = kinematic;
  this.material = material;

  this.init()

  this.calculateMass = function(){
  
  }

  this.move = function(timeStep){
    //Velocity Verlet
    if(this.material.mass == 0) return;
    let newCenter = this.center.add(this.velocity.scale(timeStep)).add(this.acceleration.scale(0.5*timeStep*timeStep));
    let newAcceleration = this.accelerate();
    let newVelocity = this.velocity.add(this.acceleration.add(newAcceleration).scale(0.5*timeStep));
    this.center = newCenter;
    this.velocity = newVelocity;
    this.acceleration = newAcceleration;
    this.aabb = AABB.generate.call(this);

  }

  this.accelerate = function(){
    let gravity = new Vector(0, -9.81);
    return gravity;
  }
}

let materials =  {
  "wood": new Material(0.66, 0.5, 0.3, 0.2),
  "steel": new Material(8.05, 0.56, 0.6, 0.3),
  "glass": new Material(2.5, 0.9, 0.9, 0.4),
  "ice": new Material(0.9, 0.88, 0.1, 0.01)
};

let uniqueID = (function(){
  let id = 0;
  return function(){
    return id++; 
  };
})();