function Contact(position = new Vector(0,0), normal = Vector.unitRandom(), penetration = 0){
  this.position = position;
  this.normal = normal;
  this.penetration = penetration;
}
function Manifold(contacts = [], count = 0, 
                  object1 = new RigidBody({}), object2 = new RigidBody({})){
  this.contacts = contacts;
  this.count = count;
  this.object1 = object1;
  this.object2 = object2;
}
Manifold.prototype.intersect = function(){
  if(this.object1.shape instanceof Polygon && this.object2.shape instanceof Polygon){
    contactOne = Polygon.getAxisOfLeastPenetration(this.object1, this.object2);
    if(contactOne.penetration[0] > 0) return false;
    //(new Point(this.object1.shape.vertices[contactOne.position[1]])).draw(ctx);
    contactTwo = Polygon.getAxisOfLeastPenetration(this.object2, this.object1);
    if(contactTwo.penetration[0] > 0) return false;

    clippedContact = Polygon.faceClipping(this.object2, contactTwo, this.object1, contactOne);
    clippedPoint = clippedContact.position;
    normal = clippedContact.normal;
    penetration = clippedContact.penetration;
    this.count = clippedPoint.length;
    for(let i = 0; i < this.count; i++){
      this.contacts[i] = new Contact(clippedPoint[i], normal[i], Math.abs(penetration[i]));
      //(new Point(clippedPoint[i])).draw(ctx);
      //normal[i].scale(20).draw(ctx, clippedPoint[i], "#4287f5")
    }
    return true;
  }
  if(this.object1.shape instanceof Circle && this.object2.shape instanceof Circle){
    let pointToCenter = this.object2.kinematic.center.subtract(this.object1.kinematic.center);
    let jointRadius = this.object1.shape.radius + this.object2.shape.radius;
    if(pointToCenter.sqrLength() > jointRadius*jointRadius) return false;
    let centerDistance = pointToCenter.length();

    if(centerDistance != 0){
      let penetration = jointRadius - centerDistance;
      let normal = pointToCenter.scale(1/centerDistance);
      let position = this.object1.kinematic.center.add(normal.scale(this.object1.shape.radius));
      this.contacts[0] = new Contact(position, normal, penetration);
      this.count = 1;
      return true;
    }
    else{
      let penetration = Math.max(this.object1.shape.radius, this.object2.shape.radius);
      let normal = Vector.unitRandom();
      let position = this.object1.kinematic.center.clone();
      this.contacts[0] = new Contact(position, normal, penetration);
      this.count = 1;
      return true;
    }
  }
  if(this.object1.shape instanceof Polygon && this.object2.shape instanceof Circle){
    let contact = Polygon.getClosetAxisToCircle(this.object1, this.object2);
    if(contact.penetration < 0){
      let penetration = Math.abs(contact.penetration) + this.object2.shape.radius;
      let position = this.object2.kinematic.center.subtract(contact.normal.scale(penetration));
      this.contacts[0] = new Contact(position, contact.normal, penetration);
      this.count = 1;
      return true;
    }
    //Left Voronoi region
    let startVertex = this.object1.shape.vertices[contact.position[0]];
    let startVertexToCenter = this.object2.kinematic.center.subtract(startVertex);
    let pointProjectToStartVertex = contact.normal.perpendicular2().dot(startVertexToCenter);
    if(pointProjectToStartVertex < 0){
      if(startVertexToCenter.sqrLength() > this.object2.shape.radius*this.object2.shape.radius) return false;
      let penetration = this.object2.shape.radius - startVertexToCenter.length();
      let normal = startVertexToCenter.normalize();
      let position = startVertex.subtract(normal.scale(penetration));
      this.contacts[0] = new Contact(position, normal, penetration);
      this.count = 1;
      return true;
    }
    //Right Voronoi region
    let endVertex = this.object1.shape.vertices[contact.position[1]];
    let endVertexToCenter = this.object2.kinematic.center.subtract(endVertex);
    let pointProjectToEndVertex = contact.normal.perpendicular().dot(endVertexToCenter);
    if(pointProjectToEndVertex < 0){
      if(endVertexToCenter.sqrLength() > this.object2.shape.radius*this.object2.shape.radius) return false;
      let penetration = this.object2.shape.radius - endVertexToCenter.length();
      let normal = endVertexToCenter.normalize();
      let position = endVertex.subtract(normal.scale(penetration));
      this.contacts[0] = new Contact(position, normal, penetration);
      this.count = 1;
      return true;
    }
    //Middle Voronoi region
    let pointProjectToFace = endVertex.add(contact.normal.perpendicular().scale(pointProjectToEndVertex));
    let pointToCenter = this.object2.kinematic.center.subtract(pointProjectToFace);
    if(pointToCenter.sqrLength() > this.object2.shape.radius*this.object2.shape.radius) return false;
    let penetration = this.object2.shape.radius - pointToCenter.length();
    let position = this.object2.kinematic.center.subtract(contact.normal.scale(this.object2.shape.radius - penetration));
    this.contacts[0] = new Contact(position, contact.normal, penetration);
    this.count = 1;
    return true;
  }
  if(this.object1.shape instanceof Circle && this.object2.shape instanceof Polygon){
    let contact = Polygon.getClosetAxisToCircle(this.object2, this.object1);
    if(contact.penetration < 0){
      let penetration = Math.abs(contact.penetration) + this.object1.shape.radius;
      let position = this.object1.kinematic.center.subtract(contact.normal.scale(penetration));
      this.contacts[0] = new Contact(position, contact.normal.negate(), penetration);
      this.count = 1;
      return true;
    }
    //Left Voronoi region
    let startVertex = this.object2.shape.vertices[contact.position[0]];
    let startVertexToCenter = this.object1.kinematic.center.subtract(startVertex);
    let pointProjectToStartVertex = contact.normal.perpendicular2().dot(startVertexToCenter);
    if(pointProjectToStartVertex < 0){
      if(startVertexToCenter.sqrLength() > this.object1.shape.radius*this.object1.shape.radius) return false;
      let penetration = this.object1.shape.radius - startVertexToCenter.length();
      let normal = startVertexToCenter.normalize();
      let position = startVertex.subtract(normal.scale(penetration));
      this.contacts[0] = new Contact(position, normal.negate(), penetration);
      this.count = 1;
      return true;
    }
    //Right Voronoi region
    let endVertex = this.object2.shape.vertices[contact.position[1]];
    let endVertexToCenter = this.object1.kinematic.center.subtract(endVertex);
    let pointProjectToEndVertex = contact.normal.perpendicular().dot(endVertexToCenter);
    if(pointProjectToEndVertex < 0){
      if(endVertexToCenter.sqrLength() > this.object1.shape.radius*this.object1.shape.radius) return false;
      let penetration = this.object1.shape.radius - endVertexToCenter.length();
      let normal = endVertexToCenter.normalize();
      let position = endVertex.subtract(normal.scale(penetration));
      this.contacts[0] = new Contact(position, normal.negate(), penetration);
      this.count = 1;
      return true;
    }
    //Middle Voronoi region
    let pointProjectToFace = endVertex.add(contact.normal.perpendicular().scale(pointProjectToEndVertex));
    let pointToCenter = this.object1.kinematic.center.subtract(pointProjectToFace);
    if(pointToCenter.sqrLength() > this.object1.shape.radius*this.object1.shape.radius) return false;
    let penetration = this.object1.shape.radius - pointToCenter.length();
    let position = this.object1.kinematic.center.subtract(contact.normal.scale(this.object1.shape.radius - penetration));
    this.contacts[0] = new Contact(position, contact.normal.negate(), penetration);
    this.count = 1;
    return true;
  }
  return false;
};
Manifold.prototype.resolve = function(){
  if(this.object1.kinematic.massInverse == 0 && this.object2.kinematic.massInverse == 0) return false;
  if(this.count == 0) return false;
  for(let index = 0; index < this.count; index++){
    let firstCenterToContact = this.contacts[index].position.subtract(this.object1.kinematic.center);
    let secondCenterToContact = this.contacts[index].position.subtract(this.object2.kinematic.center);

    //relative velocity if object 1 is to fixed in place
    let relativeVelocity = getRelativeVelocity(this.object1, firstCenterToContact, this.object2, secondCenterToContact);
    let velocityinNormal = relativeVelocity.dot(this.contacts[index].normal);
    if(velocityinNormal > 0) return false; //velocity in same direction of normal

    let massDenominator = getMassDenominator(this.object1, this.object2, this.contacts[index].position, this.contacts[index].normal);

    let restitution = Math.min(this.object1.material.restitution, this.object2.material.restitution);
    let impulseNormal = Math.max(-(1 + restitution) * velocityinNormal / (massDenominator),0);
    let collisionImpulse = this.contacts[index].normal.scale(impulseNormal);

    this.object1.kinematic.applyImpulse(collisionImpulse.negate(), firstCenterToContact);
    this.object2.kinematic.applyImpulse(collisionImpulse, secondCenterToContact);

    //--------Apply frictional impulse--------------
    relativeVelocity = getRelativeVelocity(this.object1, firstCenterToContact, this.object2, secondCenterToContact);
    velocityinNormal = relativeVelocity.dot(this.contacts[index].normal);

    //Determine tangent vector in same direction of velocity
    let tangent = relativeVelocity.subtract(this.contacts[index].normal.scale(velocityinNormal));
    if(tangent.sqrLength() != 0){
      tangent = tangent.normalize();
    }
    else{
      tangent = new Vector(0,0);
    }
    //Flip tangent vector since friction oppose motion
    tangent = tangent.negate();

    //Calculate friction 
    massDenominator = getMassDenominator(this.object1, this.object2, this.contacts[index].position, tangent);
    let impulseTangent = tangent.dot(relativeVelocity); 
    impulseTangent /= (massDenominator);

    //The friction falloff between static and kinetic
    let staticCoeffriction = (this.object1.material.staticCoeffriction + this.object2.material.staticCoeffriction)/2;
    let frictionalImpulse;
    if(Math.abs(impulseTangent) < staticCoeffriction * impulseNormal){
      frictionalImpulse = tangent.scale(impulseTangent);
    }
    else{
      let kineticCoeffriction = (this.object1.material.kineticCoeffriction + this.object2.material.kineticCoeffriction)/2;
      frictionalImpulse = tangent.scale(kineticCoeffriction*impulseNormal);
    }

    //Apply frictional impulse
    this.object1.kinematic.applyImpulse(frictionalImpulse.negate(), firstCenterToContact);
    this.object2.kinematic.applyImpulse(frictionalImpulse, secondCenterToContact);
  }
};
Manifold.prototype.correctPosition = function(){
  if(this.count == 0) return false;
  if(this.object1.kinematic.massInverse == 0 && this.object2.kinematic.massInverse == 0) return false;
  //index = 0;
  for(let index = 0; index < this.count; index++){
    const penetrationAllowance = 0.01;
    const correctionPercentage = 0.3;
    //Limit correction to be greater than certain point so no flickering
    let correctionMagnitude = Math.max(this.contacts[index].penetration - penetrationAllowance, 0);

    let massDenominator = getMassDenominator(this.object1, this.object2, this.contacts[index].position, this.contacts[index].normal);

    correctionMagnitude /= massDenominator;
    correctionMagnitude *= correctionPercentage;
    let correction = this.contacts[index].normal.scale(correctionMagnitude);
    //Scale by mass so object with lower mass move more
    let firstCenterToContact = this.contacts[index].position.subtract(this.object1.kinematic.center);
    let secondCenterToContact = this.contacts[index].position.subtract(this.object2.kinematic.center);
    this.object1.kinematic.applyImpulse(correction.scale(dt), firstCenterToContact);
    this.object2.kinematic.applyImpulse(correction.negate().scale(dt), secondCenterToContact);
    this.object1.kinematic.applyCorrection(this.object1, correction.negate(), firstCenterToContact);
    this.object2.kinematic.applyCorrection(this.object2, correction, secondCenterToContact);
    
  }
};
function getMassDenominator(object1, object2, contact, vector){
  let massInverse = object1.kinematic.massInverse + object2.kinematic.massInverse;

  let firstCenterToContact = contact.subtract(object1.kinematic.center);
  let secondCenterToContact = contact.subtract(object2.kinematic.center);

  let firstCollisionRadius = firstCenterToContact.cross(vector);
  let secondCollisionRadius = secondCenterToContact.cross(vector);

  let momentOfInertiaInverse = firstCollisionRadius * firstCollisionRadius * object1.kinematic.momentOfInertiaInverse;
  momentOfInertiaInverse += secondCollisionRadius * secondCollisionRadius * object2.kinematic.momentOfInertiaInverse;

  return massInverse + momentOfInertiaInverse;
}
function getRelativeVelocity(rigidBody1, firstCenterToContact,rigidBody2, secondCenterToContact){
  let firstVelocityAtContact = rigidBody1.kinematic.velocity.add(firstCenterToContact.scalarCross(rigidBody1.kinematic.angularVelocity));
  let secondVelocityAtContact = rigidBody2.kinematic.velocity.add(secondCenterToContact.scalarCross(rigidBody2.kinematic.angularVelocity));
  return secondVelocityAtContact.subtract(firstVelocityAtContact);
}
Math.clamp = function(min, max, value){
  return Math.min(Math.max(value, min), max);
};
