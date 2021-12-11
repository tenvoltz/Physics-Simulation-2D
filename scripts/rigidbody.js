function RigidBody(args) {
  this.shape = args.shape !== undefined ? args.shape : new Shape({});
  this.kinematic = args.kinematic !== undefined ? args.kinematic : new Kinematic({});
  this.material = args.material !== undefined ? args.material : new Material({});

  this.shape.getCentroid(this);
  this.shape.constructAABB(this);
  this.kinematic.calculateMass(this);
}
function Kinematic(args) {
  this.center = args.center !== undefined ? args.center : new Vector();
  this.velocity = args.velocity !== undefined ? args.velocity : new Vector();
  this.acceleration = args.acceleration !== undefined ? args.acceleration : new Vector();
  this.angularPosition = args.angularPosition !== undefined ? args.angularPosition : 0;
  this.angularVelocity = args.angularVelocity !== undefined ? args.angularVelocity : 0;
  this.angularAcceleration = args.angularAcceleration !== undefined ? args.angularAcceleration : 0;
  this.force = args.force !== undefined ? args.force : new Vector(0, 0);
  this.torque = args.torque !== undefined ? args.torque : 0;
}
function Material(args) {
  this.density = args.density !== undefined ? args.density : 0.001; // g/cm^3
  this.restitution = args.restitution !== undefined ? Math.sqrt(args.restitution) : 1;
  this.kineticCoeffriction = args.kineticCoeffriction !== undefined ? args.kineticCoeffriction : 0.2;
  this.staticCoeffriction = args.staticCoeffriction !== undefined ? args.staticCoeffriction : 0.5;
}
function Shape() {
  this.id = uniqueID();
}
function Circle(args) {
  Shape.call(this);
  this.radius = args.radius !== undefined ? args.radius : 1;
}
function Polygon(args) {
  Shape.call(this);
  this.vertices = args.vertices !== undefined ? args.vertices : [Vector.unitRandom(), Vector.unitRandom(), Vector.unitRandom()];

  this.sortVertices();
  this.calculateNormal();
}
Kinematic.prototype.calculateMass = function (rigidBody) {
  this.mass = rigidBody.material.density * rigidBody.shape.area;
  this.massInverse = this.mass !== 0 ? 1 / this.mass : 0;

  let aabb = rigidBody.shape.aabb;
  let width = aabb.getDimension().x;
  let height = aabb.getDimension().y;
  this.momentOfInertia = this.mass * (width * width + height * height) / 12;
  this.momentOfInertiaInverse = this.momentOfInertia !== 0 ? 1 / this.momentOfInertia : 0;
};
Kinematic.prototype.move = function (rigidBody, timeStep) {
  //Verlet Integration
  if (this.mass == 0) return;
  //s' = s + vt + 1/2 * a * t^2
  let newCenter = this.center.add(this.velocity.scale(timeStep)).add(this.acceleration.scale(0.5 * timeStep * timeStep));
  //0' = 0 + wt + 1/2 * w * t^2
  let newAngularPosition = this.angularPosition + this.angularVelocity * timeStep + 0.5 * this.angularAcceleration * timeStep * timeStep;

  this.applyForce();
  this.applyTorque();

  //a' = F / m
  let newAcceleration = this.force.scale(this.massInverse);
  //a' = T / I
  let newAngularAcceleration = this.torque * this.momentOfInertiaInverse;

  //v'= v + t(a + a')/2
  let newVelocity = this.velocity.add((this.acceleration.add(newAcceleration)).scale(0.5 * timeStep));
  //w' = w + t(a + a')/2
  let newAngularVelocity = this.angularVelocity + (this.angularAcceleration + newAngularAcceleration) * 0.5 * timeStep;

  if (rigidBody.shape instanceof Polygon) {
    rigidBody.shape.rotate(this.center, newAngularPosition - this.angularPosition);
    rigidBody.shape.move(newCenter.subtract(this.center));
    rigidBody.shape.calculateNormal();
  }

  this.center = newCenter;
  this.velocity = newVelocity;
  this.acceleration = newAcceleration;

  this.angularPosition = newAngularPosition;
  this.angularVelocity = newAngularVelocity;
  this.angularAcceleration = newAngularAcceleration;

  rigidBody.shape.constructAABB(rigidBody);
};
Kinematic.prototype.applyForce = function () {
  this.force = new Vector();
  this.force = this.force.add((new Vector(0, -9.81)).scale(this.mass)); //Gravity
};
Kinematic.prototype.applyTorque = function () { };
Kinematic.prototype.applyImpulse = function (impulse, centerToContact) {
  this.velocity = this.velocity.add(impulse.scale(this.massInverse));
  this.angularVelocity = this.angularVelocity + centerToContact.cross(impulse) * this.momentOfInertiaInverse;
};
Kinematic.prototype.applyCorrection = function (rigidBody, correction, centerToContact) {
  centerTranslate = correction.scale(this.massInverse);
  centerRotate = centerToContact.cross(correction) * this.momentOfInertiaInverse;
  if (rigidBody.shape instanceof Polygon) {
    rigidBody.shape.rotate(this.center, centerRotate)
    rigidBody.shape.move(centerTranslate);
  }
  this.center = this.center.add(centerTranslate);
  this.angularPosition = this.angularPosition + centerRotate;
};
Circle.prototype.getCentroid = function (rigidBody) {
  this.area = Math.PI * rigidBody.shape.radius * rigidBody.shape.radius;
};
Circle.prototype.constructAABB = function (rigidBody) {
  let min = new Vector(rigidBody.kinematic.center.x - this.radius, rigidBody.kinematic.center.y - this.radius);
  let max = new Vector(rigidBody.kinematic.center.x + this.radius, rigidBody.kinematic.center.y + this.radius);
  this.aabb = new AABB(min, max);
};
Circle.prototype.draw = function (rigidBody, ctx, lineWidth = 2, style = '252,182,3') {
  ctx.beginPath();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = 'rgb(' + style + ')';
  ctx.fillStyle = 'rgba(' + style + ', ' + rigidBody.material.density + ')'
  ctx.arc(rigidBody.kinematic.center.x, rigidBody.kinematic.center.y, rigidBody.shape.radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.moveTo(rigidBody.kinematic.center.x, rigidBody.kinematic.center.y);
  ctx.lineTo(rigidBody.kinematic.center.x + rigidBody.shape.radius * Math.cos(rigidBody.kinematic.angularPosition),
    rigidBody.kinematic.center.y + rigidBody.shape.radius * Math.sin(rigidBody.kinematic.angularPosition));
  ctx.closePath();
  ctx.stroke();
  //this.aabb.draw(this.id, ctx);
}
Polygon.prototype.getCentroid = function (rigidBody) {
  let vertices = rigidBody.shape.vertices;
  let centroid = new Vector();
  let area = 0;
  let currentVertex = new Vector();
  let nextVertex = new Vector();
  let partialArea = 0;
  let i = 0
  for (i = 0; i < vertices.length - 1; ++i) {
    currentVertex = vertices[i];
    nextVertex = vertices[i + 1];
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
  centroid = centroid.scale(1 / (6 * area))
  this.area = Math.abs(area);
  rigidBody.kinematic.center = centroid;
};
Polygon.prototype.constructAABB = function (rigidBody) {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  this.vertices.forEach(function (vertex) {
    if (vertex.x < minX) minX = vertex.x;
    if (vertex.y < minY) minY = vertex.y;
    if (vertex.x > maxX) maxX = vertex.x;
    if (vertex.y > maxY) maxY = vertex.y;
  });
  this.aabb = new AABB(new Vector(minX, minY),
    new Vector(maxX, maxY));
};
Polygon.prototype.sortVertices = function () {
  let verticesMean = new Vector();
  this.vertices.forEach(vertex => verticesMean = verticesMean.add(vertex))
  verticesMean = verticesMean.scale(1 / this.vertices.length);
  this.vertices.sort(function counterClockwiseSort(firstVertex, secondVertex) {
    let centerToFirst = firstVertex.subtract(verticesMean);
    let centerToSecond = secondVertex.subtract(verticesMean);
    return Math.atan2(centerToFirst.y, centerToFirst.x) - Math.atan2(centerToSecond.y, centerToSecond.x);
  });
};
Polygon.prototype.draw = function (rigidBody, ctx, lineWidth = 2, style = '63, 156, 48') {
  ctx.beginPath();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = 'rgb(' + style + ')';
  ctx.fillStyle = 'rgba(' + style + ', ' + rigidBody.material.density + ')'
  ctx.moveTo(this.vertices[this.vertices.length - 1].x, this.vertices[this.vertices.length - 1].y);
  for (let index = 0; index < this.vertices.length; index++) {
    ctx.lineTo(this.vertices[index].x, this.vertices[index].y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
};
Polygon.prototype.getSupport = function (direction) {
  let maxProjectionAlongDirection = Number.NEGATIVE_INFINITY;
  let supportVertex;
  this.vertices.forEach(function (vertex) {
    let projectionAlongDirection = vertex.dot(direction);
    if (projectionAlongDirection > maxProjectionAlongDirection) {
      maxProjectionAlongDirection = projectionAlongDirection;
      supportVertex = vertex;
    }
  });
  return supportVertex;
};
Polygon.prototype.calculateNormal = function () {
  this.normals = [];
  let i = 0;
  for (i = 0; i < this.vertices.length - 1; ++i) {
    this.normals.push(this.vertices[i + 1].subtract(this.vertices[i]).perpendicular().normalize());
  }
  this.normals.push(this.vertices[0].subtract(this.vertices[i]).perpendicular().normalize());
  return this.normals;
};
Polygon.prototype.move = function (delta) {
  for (let i = 0; i < this.vertices.length; i++) {
    this.vertices[i] = this.vertices[i].add(delta);
  }
};
Polygon.prototype.rotate = function (center, delta) {
  rotationMatrix = Matrix.rotation(delta);
  for (let i = 0; i < this.vertices.length; i++) {
    this.vertices[i] = (rotationMatrix.multiplyVector(this.vertices[i].subtract(center))).add(center);
  }
};
Polygon.getAxisOfLeastPenetration = function (polygonOne, polygonTwo) {
  let maxSeparation = Number.NEGATIVE_INFINITY;
  let previousMaxVertex;
  let startMaxVertex;
  let nextMaxVertex;
  let maxNormal;
  for (let i = 0; i < polygonOne.shape.vertices.length; i++) {
    let normal = polygonOne.shape.normals[i];
    let support = polygonTwo.shape.getSupport(normal.negate());
    let startVertex = polygonOne.shape.vertices[i];
    let separation = normal.dot(support.subtract(startVertex));
    //Counterclockwise Ordering; the normal is for the line where the vertex start
    if (separation > maxSeparation) {
      maxSeparation = separation;
      previousMaxVertex = i == 0 ? polygonOne.shape.vertices.length - 1 : i - 1;
      startMaxVertex = i;
      nextMaxVertex = i == polygonOne.shape.vertices.length - 1 ? 0 : i + 1;
      maxNormal = normal;
    }
  }
  //get the nextMaxVertex separation
  let normal = polygonOne.shape.normals[nextMaxVertex];
  let support = polygonTwo.shape.getSupport(normal.negate());
  let nextVertex = polygonOne.shape.vertices[nextMaxVertex];
  let nextMaxSeparation = normal.dot(support.subtract(nextVertex));
  return new Contact([previousMaxVertex, startMaxVertex, nextMaxVertex], maxNormal, [maxSeparation, nextMaxSeparation]);
};
Polygon.getClosetAxisToCircle = function (polygon, circle) {
  let maxSeparation = Number.NEGATIVE_INFINITY;
  let startMaxVertex;
  let endMaxVertex;
  let maxNormal;
  for (let i = 0; i < polygon.shape.vertices.length; i++) {
    let normal = polygon.shape.normals[i];
    let support = circle.kinematic.center;
    let startVertex = polygon.shape.vertices[i];
    let separation = normal.dot(support.subtract(startVertex));
    //Counterclockwise Ordering; the normal is for the line where the vertex start
    if (separation > maxSeparation) {
      maxSeparation = separation;
      startMaxVertex = i;
      endMaxVertex = i == polygon.shape.vertices.length - 1 ? 0 : i + 1;
      maxNormal = normal;
    }
  }
  return new Contact([startMaxVertex, endMaxVertex], maxNormal, maxSeparation);
};
Polygon.faceClipping = function (incidentPolygon, incidentContact, referencePolygon, referenceContact) {
  let clippingPoint = [incidentPolygon.shape.vertices[incidentContact.position[1]],
  incidentPolygon.shape.vertices[incidentContact.position[2]]];
  let referencePoint = [referencePolygon.shape.vertices[referenceContact.position[0]],
  referencePolygon.shape.vertices[referenceContact.position[1]],
  referencePolygon.shape.vertices[referenceContact.position[2]]];
  let referenceNormal = [referencePolygon.shape.normals[referenceContact.position[0]],
  referencePolygon.shape.normals[referenceContact.position[1]],
  referencePolygon.shape.normals[referenceContact.position[2]]];
  for (let i = 0; i < clippingPoint.length; i++) {
    point = Polygon.lineClipping(clippingPoint[i], incidentContact.normal, referencePoint[0], referenceNormal[0]);
    clippingPoint[i] = point[1];
  }
  for (let i = 0; i < clippingPoint.length; i++) {
    point = Polygon.lineClipping(clippingPoint[i], incidentContact.normal, referencePoint[2], referenceNormal[2]);
    clippingPoint[i] = point[1];
  }
  //Delete all out of bound point
  for (let i = clippingPoint.length - 1; i >= 0; i--) {
    point = Polygon.lineClipping(clippingPoint[i], incidentContact.normal, referencePoint[1], referenceNormal[1]);
    if (point[0]) clippingPoint[i] = point[1];
    else clippingPoint.splice(i, 1);
  }
  return clippingPoint;
};
Polygon.lineClipping = function (incidentPoint, incidentNormal, referencePoint, referenceNormal) {
  let pointToReference = incidentPoint.subtract(referencePoint);
  if (referenceNormal.dot(pointToReference) < 0) return [true, incidentPoint];
  let referenceTangent = referenceNormal.perpendicular();
  let incidentTangent = incidentNormal.perpendicular();
  let parameter = referenceTangent.cross(pointToReference) / incidentTangent.cross(referenceTangent);
  return [false, incidentPoint.add(incidentTangent.scale(parameter))];
};
let materials = {
  "wood": new Material({ density: 0.66, restitution: 0.5, kineticCoeffriction: 0.3, staticCoeffriction: 0.2 }),
  "staticWood": new Material({ density: 0, restitution: 0.5, kineticCoeffriction: 0.3, staticCoeffriction: 0.2 }),
  "steel": new Material({ density: 0.805, restitution: 0.56, kineticCoeffriction: 0.6, staticCoeffriction: 0.3 }),
  "staticSteel": new Material({ density: 0, restitution: 0.56, kineticCoeffriction: 0.6, staticCoeffriction: 0.3 }),
  "glass": new Material({ density: 0.25, restitution: 0.9, kineticCoeffriction: 0.9, staticCoeffriction: 0.4 }),
  "staticGlass": new Material({ density: 0, restitution: 0.9, kineticCoeffriction: 0.9, staticCoeffriction: 0.4 }),
  "ice": new Material({ density: 0.09, restitution: 0.88, kineticCoeffriction: 0.1, staticCoeffriction: 0.05 }),
  "staticIce": new Material({ density: 0, restitution: 0.88, kineticCoeffriction: 0.1, staticCoeffriction: 0.05 })
};
let uniqueID = (function () {
  let id = 0;
  return function () {
    return id++;
  };
})();
function Point(vector) {
  this.x = vector.x;
  this.y = vector.y;
}
Point.prototype.draw = function (ctx, lineWidth = 1, strokeStyle = 'black') {
  ctx.beginPath();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeStyle;
  ctx.arc(this.x, this.y, 3, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();
};