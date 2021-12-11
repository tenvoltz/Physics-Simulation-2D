let canvas;
let ctx;
let body;
let objects;
let manifolds;

function setup(){
  body = document.querySelector('body');
  createCanvas(getWidth(body), 500);
  canvas = document.getElementById('Playground');
  canvas.style.background = "white";
  ctx = canvas.getContext('2d');
  ctx.translate(0, canvas.height); 
  ctx.scale(1, -1);

  objects = [];
  manifolds = [];

  objects.push(new RigidBody({shape: new Polygon({vertices : [new Vector(-100, 0),
                                                              new Vector(20, 0),
                                                              new Vector(20, canvas.height),
                                                              new Vector(-100, canvas.height)]}), 
                              material : materials.staticIce
              }));//Left Wall
  objects.push(new RigidBody({shape: new Polygon({vertices : [new Vector(canvas.width - 20, 0),
                                                              new Vector(canvas.width+100, 0),
                                                              new Vector(canvas.width+100, canvas.height),
                                                              new Vector(canvas.width - 20, canvas.height)]}), 
                              material : materials.staticIce
              }));//Right Wall
  objects.push(new RigidBody({shape: new Polygon({vertices : [new Vector(0,-100),
                                                              new Vector(0, 10),
                                                              new Vector(canvas.width, -100),
                                                              new Vector(canvas.width, 10)]}), 
                              material : materials.staticWood
              }));//Bottom Wall    
  objects.push(new RigidBody({shape : new Circle({radius : 50}), 
                              kinematic : new Kinematic({center : new Vector(500,60)}),
                              material : materials.ice
              }));
  objects.push(new RigidBody({shape : new Circle({radius : 50}), 
                              kinematic : new Kinematic({center : new Vector(501,300)}),
                              material : materials.ice
              }));
  objects.push(new RigidBody({shape: new Polygon({vertices : [new Vector(100,20),
                                                              new Vector(300, 30),
                                                              new Vector(100, 100),
                                                              new Vector(330, 91)]}), 
                              material : materials.ice
              }));
  objects.push(new RigidBody({shape: new Polygon({vertices : [new Vector(100, 220),
                                                              new Vector(200, 200),
                                                              new Vector(100, 300),
                                                              new Vector(230, 295)]}), 
                              material : materials.ice
              }));
  for(let i = 0; i < 10; i++){
    if(Math.random() < 1){
      let center = new Vector(Math.random()*canvas.width, Math.random()*canvas.height);
      let vertices = [];
      for(let j = Math.floor(Math.random()*5) + 3; j >= 0; j--){
        let angle = Math.random()*2*Math.PI;
        let radius = 70;
        vertices.push(center.add((new Vector(Math.cos(angle), Math.sin(angle))).scale(radius)));
      }
      objects.push(new RigidBody({shape: new Polygon({vertices : vertices}), 
                                  material : materials.ice
              }));
    }
    else{
      let center = new Vector(Math.random()*canvas.width, Math.random()*canvas.height);
      let radius = Math.random()*20+20;
      objects.push(new RigidBody({shape: new Circle({radius: radius}),
                                  kinematic: new Kinematic({center: center}),
                                  material: materials.glass}));
    }
  }

  setInterval(simulate, 1000/fps);
}

let currentTime = Date.now();
let quit = false;
let fps = 60;
let speed = 5;

function simulate(){
  render();
  advance(speed/fps);
  broadPhase();
  narrowPhase();
}

function broadPhase(){
  manifolds = [];
  for(let i = 0; i < objects.length-1; i++){
    for(let j = i+1; j < objects.length; j++){
      if(objects[i].shape.aabb.intersect(objects[j].shape.aabb)){
        manifolds.push(new Manifold(undefined, undefined, objects[i], objects[j]));
      }
    }
  }
}

function narrowPhase(){
  for(let j = manifolds.length - 1; j >= 0; j--){
    if(manifolds[j].intersect()){
      manifolds[j].resolve();
      manifolds[j].correctPosition();
      //manifolds[j].contacts[0].normal.scale(20).draw(ctx, manifolds[j].contacts[0].position);
      //if(manifolds[j].count == 2) manifolds[j].contacts[1].normal.scale(20).draw(ctx, manifolds[j].contacts[1].position);
    }
    manifolds.pop();  
  }
}

function advance(dt){
  for(let i = 0; i < objects.length; i++){
    objects[i].kinematic.move(objects[i],dt);
  }
}

function render(){
  ctx.globalCompositeOperation = 'destination-over';
  ctx.clearRect(0, 0, canvas.width, canvas.height); //clear canvas

  ctx.save();
  for(let i = 0; i < objects.length; i++){
    objects[i].shape.draw(objects[i], ctx);
    //objects[i].shape.aabb.draw(objects[i].shape.id, ctx);
    //objects[i].kinematic.velocity.draw(objects[i].kinematic.center, ctx);
  }
  ctx.restore();
}

setup();

