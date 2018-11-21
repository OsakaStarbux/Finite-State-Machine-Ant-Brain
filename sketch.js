/*
Ants are like trafic lights

Build a state machine to model the behaviour of ants
Use a wrapper class and hold a reference one of a collection of state classes.

Ants wander (random walk) until they find food.
After finding food they go directly home.
After reaching home they wander off to find food again.
If the mouse approaches a wandering ant it runs away.
If the mouse is no longer close by the ant wanders again.
*/

function AntBrain(ant) {
  // initialize the currentState var with the entry state
  this.currentState = new FindFood();
  this.ant = ant;
  this.set_state = function(newState) {
    this.currentState = newState;
  };

  this.update = function() {
    /* client calls to the wrapper function
     get delegated to the current state object
     we need a reference back to the wrapper
     so we can change its properties e.g. currentState
    */
    this.currentState.update(this);
  };
}

function FindFood() {
  this.update = function(wrapper) {
    wrapper.ant.color = "maroon";
    wrapper.ant.walk();
    if (inRange(wrapper.ant, food)) {
      moveFood();
      wrapper.set_state(new GoHome());
    }

    if (mouseClose(wrapper.ant.pos)) {
      wrapper.set_state(new RunAway());
    }
  };
}

function GoHome() {
  this.update = function(wrapper) {
    wrapper.ant.headHome();
    wrapper.ant.color = "white";
    if (inRange(wrapper.ant, home)) {
      wrapper.set_state(new FindFood());
    }
  };
}

function RunAway() {
  this.update = function(wrapper) {
    console.log("Running away");
    wrapper.ant.color = "yellow";
    wrapper.ant.runAway();
    let mousePos = createVector(mouseX, mouseY);
    if (!mouseClose(wrapper.ant.pos)) {
      wrapper.set_state(new FindFood());
    }
  };
}
function Ant() {
  this.pos = createVector(width / 2, height / 2);

  this.brain = new AntBrain(this);
  this.color = "maroon";
  this.walk = function() {
    this.pos = walk(this.pos);
  };

  this.headHome = function() {
    let velocity = goToward(this, home);
    this.pos.add(velocity);
  };

  this.runAway = function() {
    let mousePos = createVector(mouseX, mouseY);
    let velocity = goAway(this, mousePos);
    this.pos.add(velocity);
  };

  this.show = function() {
    noStroke();
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, 10, 10);
  };
}

function Food() {
  this.pos = createVector(random(width), random(height));

  this.show = function() {
    push();
    noStroke();
    fill(255);
    rect(this.pos.x, this.pos.y, 7, 7);
    pop();
  };
}

function Home() {
  this.pos = createVector(width / 2, height / 2);

  this.show = function() {
    fill(25);
    ellipse(this.pos.x, this.pos.y, 30, 10);
  };
}

let cnv;
let antBrain;
let currentMillis;
let startMillis;
let period;
let ants = [];
let food;
let stepSize;
let home;
let range;
let population;

function setup() {
  cnv = createCanvas(500, 500);
  cnv.mousePressed(reset);
  period = 500;
  range = 20;
  stepSize = 10;
  
  createSprite("home");
  createSprite("food");
  
  startMillis = millis();
  createPopulation();
}

function draw() {
  background("olivedrab");
  
  currentMillis = millis();

  if (currentMillis - startMillis >= period) {
    for (let ant of ants) {
      ant.brain.update();
    }
    startMillis = currentMillis;
  }
  showMSG();
  showSprites();
}

function walk(pos) {
  let directions = ["up", "down", "left", "right"];
  let direction = random(directions);
  if (direction === "up" && pos.y > 0) {
    pos.y -= stepSize;
  } else if (direction === "down" && pos.y < height) {
    pos.y += stepSize;
  } else if (direction === "left" && pos.x > 0) {
    pos.x -= stepSize;
  } else if (direction === "right" && pos.y < width) {
    pos.x += stepSize;
  }
  return pos;
}

function goToward(origin, destination) {
  let dx = destination.pos.x - origin.pos.x;
  let dy = destination.pos.y - origin.pos.y;
  let angle = atan2(dy, dx);
  let magnitude = 1.0;
  let velX = cos(angle) * magnitude * 10;
  let velY = sin(angle) * magnitude * 10;
  let vec = createVector(velX, velY);
  return vec;
}

function goAway(origin, repeller) {
  let dx = repeller.x - origin.pos.x;
  let dy = repeller.y - origin.pos.y;
  let angle = atan2(dy, dx) - PI;
  let magnitude = 1.0;
  let velX = cos(angle) * magnitude * 10;
  let velY = sin(angle) * magnitude * 10;
  let vec = createVector(velX, velY);
  return vec;
}

function moveFood() {
  food.pos = createVector(random(width), random(height));
}

function inRange(a, b) {
  return dist(a.pos.x, a.pos.y, b.pos.x, b.pos.y) < range;
}

function mouseClose(pos) {
  return dist(pos.x, pos.y, mouseX, mouseY) < range * 2;
}

function createSprite(kind) {
  switch (kind) {
    case "home":
      home = new Home();
      break;
    case "ant":
      ants.push(new Ant());
      break;
    case "food":
      food = new Food();
      break;
    default:
      return;
  }
}

function showSprites() {
  home.show();
  food.show();

  for (let ant of ants) {
    ant.show();
  }
}

function reset(){
  ants = [];
   startMillis = millis();
 createPopulation()
}

function createPopulation(){
   population = floor(random(1, 101));
  for (let i = 0; i < population; i++) {
    createSprite("ant");
  }
}

function showMSG(){
  push();
  fill(0);
  textSize(16);
  textAlign(CENTER, CENTER);
  text(`Population: ${population}`,
       width / 2, 
       15)
  text("click to reset, hover to scare ants",
       width / 2, 
       height - 15)
  pop()
}