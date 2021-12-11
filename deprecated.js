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
if(this.object1 instanceof Rectangle && this.object2 instanceof Rectangle){
    let aabb1 = this.object1.shape.aabb;
    let aabb2 = this.object2.shape.aabb;

    let pointToCenter = this.object2.kinematic.center.subtract(this.object1.kinematic.center);
    
    let closestPoint = pointToCenter.clone();
    let extentX = (aabb1.max.x - aabb1.min.x)*0.5;
    let extentY = (aabb1.max.y - aabb1.min.y)*0.5;
    closestPoint.x = Math.clamp(-extentX, extentX, closestPoint.x);
    closestPoint.y = Math.clamp(-extentY, extentY, closestPoint.y);
    let position = this.object1.kinematic.center.add(closestPoint);

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
if(this.object1 instanceof Rectangle && this.object2 instanceof Circle){
    let pointToCenter = this.object2.kinematic.center.subtract(this.object1.kinematic.center);
    let closestPoint = pointToCenter.clone();
    let extentX = (this.object1.shape.aabb.max.x - this.object1.shape.aabb.min.x)*0.5;
    let extentY = (this.object1.shape.aabb.max.y - this.object1.shape.aabb.min.y)*0.5;
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

    if(distance > this.object2.shape.radius*this.object2.shape.radius && !isCircleInside)
      return false;
    distance = Math.sqrt(distance);
    let penetration;
    if(isCircleInside){
      normal = normal.negate().normalize();
      penetration = this.object2.shape.radius - distance;
    }
    else{
      normal = normal.normalize();
      penetration = this.object2.shape.radius - distance;
    }
    let position = this.object1.kinematic.center.add(closestPoint);
    this.contacts[0] = new Contact(position, normal, penetration);
    this.count = 1;

    return true;
}
  /*
  objects.push(new Rectangle(new Vector(-500,canvas.height/2), new Vector(1000,canvas.height), 0, materials.steel));
  objects.push(new Rectangle(new Vector(canvas.width+500,canvas.height/2), new Vector(1000,canvas.height), 0, materials.steel));
  objects.push(new Rectangle(new Vector(canvas.width/2,-490), new Vector(canvas.width,1000), 0, materials.ice));
  */
  /*
  objects.push(new Rectangle(new Vector(80,40), new Vector(50,50), 1, materials.steel));
  objects.push(new Rectangle(new Vector(400,40), new Vector(50,50), 100, materials.steel));
  objects[4].velocity = new Vector(-30,0);
  */
  /*
  for(let i = 0; i < 100; i++){
    if(Math.random() < 0.5){
      let center = new Vector(Math.random()*canvas.width, Math.random()*canvas.height);
      let dimension = new Vector(Math.random()*20+20,Math.random()*20+20);
      objects.push(new Rectangle(center, dimension, 1, materials.glass));
      objects.push(new Rectangle(center, dimension, 1, materials.glass));
    }
    else{
      let center = new Vector(Math.random()*canvas.width, Math.random()*canvas.height);
      let radius = Math.random()*20+20;
      objects.push(new Circle(center, radius, 1, materials.glass));
      objects.push(new Circle(center, radius, 1, materials.glass));
    }
  }
  */
  /*
  for(let i = 0; i < 60; i++){
    for(let j = 0; j < 20; j++){
      let radius = 5;
      let center = new Vector(100+radius/2 + 2*radius*j, 30+radius/2 + 2*radius*i);
      objects.push(new Circle(center, radius, 1, new Material(1, 1, 0, 0)));
    }
  }
  objects.push(new Circle(new Vector(500,300), 50, 100, materials.ice));
  */
    /*
    let newTime = Date.now();
    let frameTime = newTime - currentTime;
    currentTime = newTime;

    if(frameTime > 1000) frameTime = 1000;

    let deltaTime = 1;
    while(frameTime > 0){
      deltaTime = Math.min(frameTime, timeStep);
      
      advance(deltaTime/1000);
      broadPhase();
      narrowPhase();

      frameTime -= deltaTime;
    }
  */