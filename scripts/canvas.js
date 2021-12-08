function createCanvas(width, height){
  let canvas = document.createElement('canvas');
  canvas.id = "Playground";
  canvas.width = width;
  canvas.height = height;
  canvas.style.zIndex = 8;
  canvas.style.border = "1px solid";

  let body = document.querySelector('body');
  let image = document.querySelector('img');
  body.insertBefore(canvas, image);

  let ctx = canvas.getContext("2d");
  ctx.font = '48px serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = "center";

  document.body.onkeyup = function(event) { 
    if(event.keyCode == 32 || event.key === ' ') {
        quit = !quit;
        console.log(quit);
    }
  };
}

function getWidth(element){
  let body = document.querySelector('body');
  let styles = window.getComputedStyle(element);
  let padding = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
  return element.clientWidth - padding;
}


