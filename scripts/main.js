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

  sceneOne();  //General
  //sceneTwo(); //Stacking
  //sceneThree(); //Fluid Particle
  //sceneFour(); //Restitution with static object
  //sceneFive(); //Restitution with non-static object -- Not accurate
  //sceneSix(); //Sliding friction
  //sceneSeven(); //Rolling friction with/without skidding
  //sceneEight(); //Rotative Bouncing
  //sceneNine(); //Stacking block -- Failed

  setInterval(simulate, 1000/fps);
}
function sceneOne(){
  objects = [];
  manifolds = [];
  objects.push(new RigidBody({shape: new Polygon({vertices : [new Vector(-100, 0),
                                                              new Vector(20, 0),
                                                              new Vector(20, canvas.height),
                                                              new Vector(-100, canvas.height)]}), 
                              material : materials.staticRubber
              }));//Left Wall
  objects.push(new RigidBody({shape: new Polygon({vertices : [new Vector(canvas.width - 20, 0),
                                                              new Vector(canvas.width+100, 0),
                                                              new Vector(canvas.width+100, canvas.height),
                                                              new Vector(canvas.width - 20, canvas.height)]}), 
                              material : materials.staticRubber
              }));//Right Wall
  objects.push(new RigidBody({shape: new Polygon({vertices : [new Vector(0,-100),
                                                              new Vector(0, 10),
                                                              new Vector(canvas.width, -100),
                                                              new Vector(canvas.width, 10)]}), 
                              material : materials.staticSteel
              }));//Bottom Wall
  objects.push(new RigidBody({shape: new Polygon({vertices : [new Vector(0, canvas.height + 100),
                                                              new Vector(0, canvas.height - 10),
                                                              new Vector(canvas.width, canvas.height + 100),
                                                              new Vector(canvas.width, canvas.height - 10)]}), 
                              material : materials.staticRubber
              }));//Top Wall     
  objects.push(new RigidBody({shape : new Circle({radius : 10}), 
                              kinematic : new Kinematic({center : new Vector(500,460)}),
                              material : materials.ice
              }));
  objects.push(new RigidBody({shape : new Circle({radius : 10}), 
                              kinematic : new Kinematic({center : new Vector(502,20)}),
                              material : materials.ice
              }));
  objects.push(new RigidBody({shape: new Polygon({vertices : [new Vector(550, 10),
                                                              new Vector(700, 10),
                                                              new Vector(710, 50)]}), 
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
                              material : materials.steel
              }));
  objects.push(new RigidBody({shape: new Polygon({vertices : [new Vector(440, 210),
                                                              new Vector(540, 220),
                                                              new Vector(450, 300),
                                                              new Vector(570, 285)]}), 
                              material : materials.steel
              }));
}
function sceneTwo(){
  objects = [];
  manifolds = [];
  objects.push(new RigidBody({shape: new Polygon({vertices : [new Vector(-100, 0),
                                                              new Vector(20, 0),
                                                              new Vector(20, canvas.height),
                                                              new Vector(-100, canvas.height)]}), 
                              material : materials.staticRubber
              }));//Left Wall
  objects.push(new RigidBody({shape: new Polygon({vertices : [new Vector(canvas.width - 20, 0),
                                                              new Vector(canvas.width+100, 0),
                                                              new Vector(canvas.width+100, canvas.height),
                                                              new Vector(canvas.width - 20, canvas.height)]}), 
                              material : materials.staticRubber
              }));//Right Wall
  objects.push(new RigidBody({shape: new Polygon({vertices : [new Vector(0,-100),
                                                              new Vector(0, 10),
                                                              new Vector(canvas.width, -100),
                                                              new Vector(canvas.width, 10)]}), 
                              material : materials.staticRubber
              }));//Bottom Wall     
  for(let i = 0; i < 100; i++){
    if(Math.random() < 0.5){
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
}
function sceneThree(){
  objects = [];
  manifolds = [];
  objects.push(new RigidBody({shape: new Polygon({vertices : [new Vector(-100, 0),
                                                              new Vector(20, 0),
                                                              new Vector(20, canvas.height),
                                                              new Vector(-100, canvas.height)]}), 
                              material : materials.staticRubber
              }));//Left Wall
  objects.push(new RigidBody({shape: new Polygon({vertices : [new Vector(canvas.width - 20, 0),
                                                              new Vector(canvas.width+100, 0),
                                                              new Vector(canvas.width+100, canvas.height),
                                                              new Vector(canvas.width - 20, canvas.height)]}), 
                              material : materials.staticRubber
              }));//Right Wall
  objects.push(new RigidBody({shape: new Polygon({vertices : [new Vector(0,-100),
                                                              new Vector(0, 10),
                                                              new Vector(canvas.width, -100),
                                                              new Vector(canvas.width, 10)]}), 
                              material : materials.staticWood
              }));//Bottom Wall  
  for(let i = 0; i < 60; i++){
    for(let j = 0; j < 20; j++){
      let radius = 5;
      let center = new Vector(100+radius/2 + 2*radius*j, 30+radius/2 + 2*radius*i);
      objects.push(new RigidBody({shape: new Circle({radius: radius}),
                                  kinematic: new Kinematic({center: center}),
                                  material: new Material({restitution: 1, kineticCoeffriction: 0, staticCoeffriction: 0})}));
    }
  }
  objects.push(new RigidBody({shape : new Circle({radius : 50}), 
                              kinematic : new Kinematic({center : new Vector(402,170)}),
                              material : materials.ice
              }));
  objects.push(new RigidBody({shape: new Polygon({vertices : [new Vector(380,20),
                                                              new Vector(535, 20),
                                                              new Vector(390, 70),
                                                              new Vector(550, 100)]}), 
                              material : materials.ice
              }));
  objects.push(new RigidBody({shape: new Polygon({vertices : [new Vector(20, 820),
                                                              new Vector(40, 820),
                                                              new Vector(40, 840),
                                                              new Vector(20, 840)]}), 
                              material : new Material({density: 1})
              }));
}
function sceneFour(){
  objects = [];
  manifolds = [];
  let width = 61;
  let gap = (canvas.width - width*11)/12;  
  for(let i = 0; i < 11; i++){
    objects.push(new RigidBody({shape: new Polygon({vertices : [new Vector(width*i+gap*(i+1),-100),
                                                                new Vector(width*i+gap*(i+1),10),
                                                                new Vector(width*(i+1)+gap*(i+1), -100),
                                                                new Vector(width*(i+1)+gap*(i+1), 10)]}), 
                              material : new Material({density: 0, restitution: i/10})
              }));
    objects.push(new RigidBody({shape : new Circle({radius : 30}), 
                                kinematic : new Kinematic({center : new Vector(width*(i+0.5)+gap*(i+1), 300)}),
                                material : new Material({restitution: i/10})
              }));  
  }     
}
function sceneFive(){
  objects = [];
  manifolds = [];
  let width = 60;
  let gap = (canvas.width - width*11)/12;  
  for(let i = 0; i < 11; i++){
    objects.push(new RigidBody({shape: new Polygon({vertices : [new Vector(width*i+gap*(i+1),-100),
                                                                new Vector(width*i+gap*(i+1),10),
                                                                new Vector(width*(i+1)+gap*(i+1), -100),
                                                                new Vector(width*(i+1)+gap*(i+1), 10)]}), 
                              material : new Material({density: 0, restitution: 1})
              }));
    objects.push(new RigidBody({shape : new Circle({radius : 30}), 
                                kinematic : new Kinematic({center : new Vector(width*(i+0.5)+gap*(i+1), 300)}),
                                material : new Material({restitution: i/10})
              }));
    objects.push(new RigidBody({shape : new Circle({radius : 30}), 
                                kinematic : new Kinematic({center : new Vector(width*(i+0.5)+gap*(i+1), 40)}),
                                material : new Material({restitution: i/10})
              }));    
  }     
}
function sceneSix(){
  objects = [];
  manifolds = [];
  let height = 20;
  let blockHeight = 10;
  let gap = (canvas.height - (height+blockHeight)*11)/11;  
  for(let i = 0; i < 11; i++){
    objects.push(new RigidBody({shape: new Polygon({vertices : [new Vector(0, (height + blockHeight)*(i)+gap*(i)),
                                                                new Vector(0, (height + blockHeight)*(i)+gap*(i)+height),
                                                                new Vector(canvas.width, (height + blockHeight)*(i)+gap*(i)),
                                                                new Vector(canvas.width, (height + blockHeight)*(i)+gap*(i)+height)]}), 
                                material : new Material({density: 0, restitution: 0, kineticCoeffriction: i/10, staticCoeffriction:i/10})
              }));
    objects.push(new RigidBody({shape: new Polygon({vertices : [new Vector(10,(height + blockHeight)*(i)+gap*(i)+height),
                                                                new Vector(10,(height + blockHeight)*(i+1)+gap*(i)),
                                                                new Vector(60,(height + blockHeight)*(i)+gap*(i)+height),
                                                                new Vector(60,(height + blockHeight)*(i+1)+gap*(i))]}),
                                kinematic: new Kinematic({velocity: new Vector(20, 0)}), 
                                material : new Material({restitution: 0, kineticCoeffriction: i/10, staticCoeffriction:i/10})
              }));
  }
}
function sceneSeven(){
  objects = [];
  manifolds = [];
  let height = 10;
  let blockHeight = 20;
  let gap = (canvas.height - (height+blockHeight)*11)/11;  
  for(let i = 0; i < 11; i++){
    objects.push(new RigidBody({shape: new Polygon({vertices : [new Vector(0, (height + blockHeight)*(i)+gap*(i)),
                                                                new Vector(0, (height + blockHeight)*(i)+gap*(i)+height),
                                                                new Vector(canvas.width, (height + blockHeight)*(i)+gap*(i)),
                                                                new Vector(canvas.width, (height + blockHeight)*(i)+gap*(i)+height)]}), 
                                material : new Material({density: 0, restitution: 0, kineticCoeffriction: 0.1, staticCoeffriction:0.1})
              }));
    objects.push(new RigidBody({shape : new Circle({radius : blockHeight/2}), 
                                kinematic : new Kinematic({center : new Vector(blockHeight/2, (height + blockHeight)*(i)+gap*(i)+height+blockHeight/2), velocity: new Vector(i*5, 0)}),
                                material : new Material({restitution: 0, kineticCoeffriction: 0.1, staticCoeffriction:0.1})
              }));
  }
}
function sceneEight(){
  objects = [];
  manifolds = [];
  let width = canvas.width/3;
  let wallWidth = 20;
  for(let i = 0; i < 3; i++){
    objects.push(new RigidBody({shape: new Polygon({vertices : [new Vector(width*i, 0),
                                                              new Vector(width*i + wallWidth, 0),
                                                              new Vector(width*i, canvas.height),
                                                              new Vector(width*i + wallWidth, canvas.height)]}), 
                              material : materials.staticWood
              }));//Left Wall
    objects.push(new RigidBody({shape: new Polygon({vertices : [new Vector(width*(i+1), 0),
                                                              new Vector(width*(i+1)-wallWidth, 0),
                                                              new Vector(width*(i+1)-wallWidth, canvas.height),
                                                              new Vector(width*(i+1), canvas.height)]}), 
                              material : materials.staticWood
              }));//Right Wall    
    objects.push(new RigidBody({shape: new Polygon({vertices : [new Vector(width*i, canvas.height - wallWidth),
                                                              new Vector(width*(i+1), canvas.height - wallWidth),
                                                              new Vector(width*i, canvas.height),
                                                              new Vector(width*(i+1), canvas.height)]}), 
                              material : materials.staticWood
              }));//Top wall
    objects.push(new RigidBody({shape: new Polygon({vertices : [new Vector(width*i, 0),
                                                              new Vector(width*(i+1), 0),
                                                              new Vector(width*i, wallWidth),
                                                              new Vector(width*(i+1), wallWidth)]}), 
                              material : materials.staticRubber
              }));//Left Wall
    objects.push(new RigidBody({shape : new Circle({radius : wallWidth/2}), 
                                kinematic : new Kinematic({center : new Vector(width*i+wallWidth*2, canvas.height/2), velocity: new Vector(10, 0), angularVelocity: (i-1)*5}),
                                material : new Material({restitution: 0.8, kineticCoeffriction: 0.2, staticCoeffriction:0.3})
              }));
  }
}
function sceneNine(){
  objects = [];
  manifolds = [];
  objects.push(new RigidBody({shape: new Polygon({vertices : [new Vector(-100, 0),
                                                              new Vector(20, 0),
                                                              new Vector(20, canvas.height),
                                                              new Vector(-100, canvas.height)]}), 
                              material : materials.staticRubber
              }));//Left Wall
  objects.push(new RigidBody({shape: new Polygon({vertices : [new Vector(canvas.width - 20, 0),
                                                              new Vector(canvas.width+100, 0),
                                                              new Vector(canvas.width+100, canvas.height),
                                                              new Vector(canvas.width - 20, canvas.height)]}), 
                              material : materials.staticRubber
              }));//Right Wall
  objects.push(new RigidBody({shape: new Polygon({vertices : [new Vector(0,-100),
                                                              new Vector(0, 10),
                                                              new Vector(canvas.width, -100),
                                                              new Vector(canvas.width, 10)]}), 
                              material : materials.staticWood
              }));//Bottom Wall  
  let width = 40;
  let height = 40;
  for(let i = 0; i < 10; i++){
    for(let j = 0; j < 10; j++){
      objects.push(new RigidBody({shape: new Polygon({vertices : [new Vector(50+width*j, height*i+20),
                                                              new Vector(50+width*(j+1), height*i+20),
                                                              new Vector(50+width*(j+1), height*(i+1)+20),
                                                              new Vector(50+width*j, height*(i+1)+20)]}), 
                              material : materials.wood
              }));  
    }
  }
} 

let fps = 120;
let speed = 5;
let dt = speed/fps;
function simulate(){
  render();
  advance(speed/fps);
  broadPhase();
  narrowPhase();
}
function render(){
  ctx.globalCompositeOperation = 'destination-over';
  ctx.clearRect(0, 0, canvas.width, canvas.height); //clear canvas

  ctx.save();
  for(let i = 0; i < objects.length; i++){
    objects[i].shape.draw(objects[i], ctx);
  }
  ctx.restore();
}
function advance(dt){
  for(let i = 0; i < objects.length; i++){
    objects[i].kinematic.move(objects[i],dt);
  }
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
    }
  }
}
setup();

/* Debugging Purpose
//manifolds[j].contacts[0].normal.scale(20).draw(ctx, manifolds[j].contacts[0].position);
//objects[i].shape.aabb.draw(objects[i].shape.id, ctx);
//objects[i].kinematic.velocity.draw(objects[i].kinematic.center, ctx);
*/