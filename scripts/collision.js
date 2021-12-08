function Contact(position = new Vector(0,0), normal = Vector.unitRandom(), penetration = 0){
  this.position = position;
  this.normal = normal;
  this.penetration = penetration;
}
function Manifold(contacts = [], count = 0, 
                  object1 = new Body(), object2 = new Body()){
  this.contacts = contacts;
  this.count = count;
  this.object1 = object1;
  this.object2 = object2;
}
Manifold.prototype.intersect = function(){
  if(this.object1 instanceof Rectangle && this.object2 instanceof Rectangle){
    let aabb1 = this.object1.aabb;
    let aabb2 = this.object2.aabb;

    let pointToCenter = this.object2.center.subtract(this.object1.center);
    
    let closestPoint = pointToCenter.clone();
    let extentX = (aabb1.max.x - aabb1.min.x)*0.5;
    let extentY = (aabb1.max.y - aabb1.min.y)*0.5;
    closestPoint.x = Math.clamp(-extentX, extentX, closestPoint.x);
    closestPoint.y = Math.clamp(-extentY, extentY, closestPoint.y);
    let position = this.object1.center.add(closestPoint);

    let extent1 = (aabb1.max.x - aabb1.min.x)*0.5;
    let extent2 = (aabb2.max.x - aabb2.min.x)*0.5;
    let overlapX = extent1 + extent2 - Math.abs(pointToCenter.x);
    if(overlapX > 0){
      let extent1 = (aabb1.max.y - aabb1.min.y)*0.5;
      let extent2 = (aabb2.max.y - aabb2.min.y)*0.5;
      let overlapY = extent1 + extent2 - Math.abs(pointToCenter.y);
      if(overlapY > 0){
        if(overlapX < overlapY){
          let normal;
          if(pointToCenter.x < 0){
            normal = new Vector(-1, 0);
          }
          else{
            normal = new Vector(1, 0);
          }
          let penetration = overlapX;
          this.contacts[0] = new Contact(position, normal, penetration);
          this.count = 1;
          return true;
        }
        else{
          let normal;
          if(pointToCenter.y < 0){
            normal = new Vector(0, -1);
          }
          else{
            normal = new Vector(0, 1);
          }
          let penetration = overlapY;
          this.contacts[0] = new Contact(position, normal, penetration);
          this.count = 1;
          return true;
        }
      }
    }
    return false;  
  }
  if(this.object1 instanceof Circle && this.object2 instanceof Circle){
    let pointToCenter = this.object2.center.subtract(this.object1.center);
    let jointRadius = this.object1.radius + this.object2.radius;
    if(pointToCenter.sqrLength() > jointRadius*jointRadius) return false;
    let centerDistance = pointToCenter.length();

    if(centerDistance != 0){
      let penetration = jointRadius - centerDistance;
      let normal = pointToCenter.scale(1/centerDistance);
      let position = this.object1.center.add(normal.scale(this.object1.radius));
      this.contacts[0] = new Contact(position, normal, penetration);
      this.count = 1;
      return true;
    }
    else{
      let penetration = Math.max(this.object1.radius, this.object2.radius);
      let normal = Vector.unitRandom();
      let position = this.object1.center.clone()
      this.contacts[0] = new Contact(position, normal, penetration);
      this.count = 1;
      return true;
    }
  }
  if(this.object1 instanceof Circle){
    let temp = this.object1;
    this.object1 = this.object2;
    this.object2 = temp;
  }
  if(this.object1 instanceof Rectangle && this.object2 instanceof Circle){
    let pointToCenter = this.object2.center.subtract(this.object1.center);
    let closestPoint = pointToCenter.clone();
    let extentX = (this.object1.aabb.max.x - this.object1.aabb.min.x)*0.5;
    let extentY = (this.object1.aabb.max.y - this.object1.aabb.min.y)*0.5;
    closestPoint.x = Math.clamp(-extentX, extentX, closestPoint.x);
    closestPoint.y = Math.clamp(-extentY, extentY, closestPoint.y);

    let isCircleInside = false;
    if(pointToCenter.equals(closestPoint)){
      //The circle center is inside the AABB
      isCircleInside = true;
      if(Math.abs(pointToCenter.x) > Math.abs(pointToCenter.y)){
        if(closestPoint.x > 0){
          closestPoint.x = extentX;
        }
        else{
          closestPoint.x = -extentX;
        }
      }
      else{
        if(closestPoint.y > 0){
          closestPoint.y = extentY;
        }
        else{
          closestPoint.y = -extentY;
        }
      }
    }

    let normal = pointToCenter.subtract(closestPoint);
    let distance = normal.sqrLength();

    if(distance > this.object2.radius*this.object2.radius && !isCircleInside)
      return false;
    distance = Math.sqrt(distance);
    let penetration;
    if(isCircleInside){
      normal = normal.negate().normalize();
      penetration = this.object2.radius - distance;
    }
    else{
      normal = normal.normalize();
      penetration = this.object2.radius - distance;
    }
    let position = this.object1.center.add(closestPoint);
    this.contacts[0] = new Contact(position, normal, penetration);
    this.count = 1;

    return true;
  }
  return false;
};
Manifold.prototype.resolve = function(){
  if(this.object1.massInverse == 0 && this.object2.massInverse == 0) return false;
  if(this.count == 0) return false;
  //relative velocity if object 1 is to fixed in place
  let relativeVelocity = this.object2.velocity.subtract( this.object1.velocity);
  let velocityinNormal = relativeVelocity.dot(this.contacts[0].normal);
  if(velocityinNormal > 0) return false; //velocity in same direction of normal
  //Get the energy lost from the less bouncy object
  let restitution = Math.min(this.object1.material.restitution, this.object2.material.restitution);
  let impulseMagnitude = -(1 + restitution) * velocityinNormal / (this.object1.massInverse + this.object2.massInverse);
  let impulseNormal = this.contacts[0].normal.scale(impulseMagnitude);

  this.object1.velocity = this.object1.velocity.subtract(impulseNormal.scale(this.object1.massInverse));
  this.object2.velocity = this.object2.velocity.add(impulseNormal.scale(this.object2.massInverse));

  //--------Apply frictional impulse--------------
  relativeVelocity = this.object2.velocity.subtract(this.object1.velocity);
  velocityinNormal = relativeVelocity.dot(this.contacts[0].normal);

  let tangent = relativeVelocity.subtract(this.contacts[0].normal.scale(velocityinNormal));
  if(tangent.sqrLength() != 0){
    tangent = tangent.normalize();
  }
  else{
    tangent = new Vector(0,0);
  }
  //let tangent = this.contacts[0].normal.perpendicular();
  //if(tangent.dot(relativeVelocity) > 0) tangent = tangent.negate();

  //tangent.scale(50).draw(this.contacts[0].position,ctx);

  let impulseTangent = tangent.dot(relativeVelocity); 
  impulseTangent /= (this.object1.massInverse + this.object2.massInverse);

  let staticCoeffriction = (this.object1.material.staticCoeffriction + this.object2.material.staticCoeffriction)*0.5;

  let frictionalImpulse;
  if(Math.abs(impulseTangent) < staticCoeffriction * impulseMagnitude){
    frictionalImpulse = tangent.scale(-impulseTangent);
  }
  else{
    let kineticCoeffriction = (this.object1.material.kineticCoeffriction + this.object2.material.kineticCoeffriction)*0.5;
    frictionalImpulse = tangent.scale(kineticCoeffriction*-impulseMagnitude);
  }

  this.object1.velocity = this.object1.velocity.subtract(frictionalImpulse.scale(this.object1.massInverse));
  this.object2.velocity = this.object2.velocity.add(frictionalImpulse.scale(this.object2.massInverse));
};
Manifold.prototype.correctPosition = function(){
  if(this.count == 0) return false;
  if(this.object1.massInverse == 0 && this.object2.massInverse == 0) return false;
  const penetrationAllowance = 0.01;
  const correctionPercentage = 0.3;
  //Limit correction to be greater than certain point so no flickering
  let correctionMagnitude = Math.max(this.contacts[0].penetration - penetrationAllowance, 0);
  correctionMagnitude /= this.object1.massInverse + this.object2.massInverse;
  correctionMagnitude *= correctionPercentage;
  let correction = this.contacts[0].normal.scale(correctionMagnitude);

  //Scale by mass so object with lower mass move more
  this.object1.center = this.object1.center.subtract(correction.scale(this.object1.massInverse));
  this.object2.center = this.object2.center.add(correction.scale(this.object2.massInverse));
};

Math.clamp = function(min, max, value){
  return Math.min(Math.max(value, min), max);
}
