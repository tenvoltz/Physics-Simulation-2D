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

  objects = [];
  manifolds = [];
  objects.push(new Rectangle(new Vector(-500,canvas.height/2), new Vector(1000,canvas.height), 0, materials.steel));
  objects.push(new Rectangle(new Vector(canvas.width+500,canvas.height/2), new Vector(1000,canvas.height), 0, materials.steel));
  objects.push(new Rectangle(new Vector(canvas.width/2,-490), new Vector(canvas.width,1000), 0, materials.ice));
  /*
  objects.push(new Rectangle(new Vector(80,40), new Vector(50,50), 1, materials.steel));
  objects.push(new Rectangle(new Vector(400,40), new Vector(50,50), 100, materials.steel));
  objects[4].velocity = new Vector(-30,0);
  */

  objects.push(new Circle(new Vector(500,35), 50, 10, materials.ice));
  objects.push(new Circle(new Vector(501,300), 50, 10, materials.ice));
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
  ctx.translate(0, canvas.height); 
  ctx.scale(1, -1);
  
  setInterval(simulate, 1000/fps);
}

let currentTime = Date.now();
let quit = false;
let fps = 100;
let speed = 10;

function simulate(){
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
  render();
  advance(speed/fps);
  broadPhase();
  narrowPhase();
}

function broadPhase(){
  for(let i = 0; i < objects.length-1; i++){
    for(let j = i+1; j < objects.length; j++){
      if(objects[i].aabb.intersect(objects[j].aabb)){
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
      //manifolds[j].contacts[0].normal.scale(20).draw(manifolds[j].contacts[0].position, ctx);
      manifolds.pop();
    }  
  }
}

function advance(dt){
  for(let i = 0; i < objects.length; i++){
    objects[i].move(dt);
  }
}

function render(){
  ctx.globalCompositeOperation = 'destination-over';
  ctx.clearRect(0, 0, canvas.width, canvas.height); 
  // clear canvas

  ctx.save();
  for(let i = 0; i < objects.length; i++){
    objects[i].draw(ctx);
    //objects[i].velocity.draw(objects[i].center, ctx);
  }
  ctx.restore();
}

setup();

