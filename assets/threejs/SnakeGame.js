// * Initialize webGL
const canvas = document.getElementById("snakeCanvas");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true
});
renderer.setClearColor('rgb(255,255,255)');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 100);
camera.position.set(0, -7, 18);
scene.add(camera);

camera.lookAt(scene.position);

// * Render loop
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
const clock = new THREE.Clock();

//render plane
const geometry = new THREE.PlaneGeometry(10, 10, 10, 10);
const material = new THREE.MeshBasicMaterial({ color: 'grey', side: THREE.DoubleSide });
const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

//render grid
const grid = new THREE.GridHelper(10, 10, 'black', 'black');
grid.rotation.x = Math.PI / 2;
scene.add(grid);

//some predefined constants
const Sizes = {
  defaultSnakeSize: 1,
  cube: 0.95,
  grid: 1,
  ballRadius: 0.5
}

//boundaries defined by the plane size
const Boundaries = {
  left: -(plane.geometry.parameters.width / 2),
  right: plane.geometry.parameters.width / 2,
  up: plane.geometry.parameters.height / 2,
  down: -(plane.geometry.parameters.height / 2)
}

//Game state variables
const GameState = {
  running: false,
  intervalId: 0
}

//helper function
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

//materials
const Materials = {
  head : new THREE.MeshBasicMaterial({ color: 'green' }),
  body : new THREE.MeshBasicMaterial({ color: 'blue' }),
  ball : new THREE.MeshBasicMaterial({ color: 'red' })
}

//array of cubes that will be used as the snake's body and head
//the snake will be implemented as a reverse array; the first array element 
//is the snake's tail, and the last one is the head.
let cubes = new Array(Sizes.defaultSnakeSize);
const cubeGeom = new THREE.BoxGeometry(Sizes.cube, Sizes.cube, Sizes.cube);

//their correspoonding speeds
let speed = new THREE.Vector3(0, 0, 0);
const speedValue = 0.004;
let speeds = new Array(cubes.length);

//for placing the elements at square centers
const positionCalibration = new THREE.Vector3(1, 1, -1);
positionCalibration.multiplyScalar(-0.5 * Sizes.cube);

function spawnSnake() {
  //the spawn coordinates are chosen so that the snake doesn't spawn right in front of the wall (relevant if default spawn ength is > 1 and the snake is horizontally alligned)
  let spawnCoordX = getRandomInt(plane.geometry.parameters.width / 2) - Sizes.defaultSnakeSize;
  let spawnCoordY = getRandomInt(plane.geometry.parameters.width / 2) - Sizes.defaultSnakeSize;

  //spawn the body first - if the default (spawn) size is larger than 1 the snake will be alligned horizontally
  if (Sizes.defaultSnakeSize > 1) {
    for (let i = 0; i < cubes.length - 1; i++) {
      cubes[i] = new THREE.Mesh(cubeGeom, Materials.body);
      cubes[i].position.set(i + spawnCoordX - (cubes.length - 1), spawnCoordY);
      cubes[i].position.add(positionCalibration);
      scene.add(cubes[i]);
    }
  }

  //then spawn head
  cubes[cubes.length - 1] = new THREE.Mesh(cubeGeom, Materials.head);
  cubes[cubes.length - 1].position.set(spawnCoordX, spawnCoordY);
  cubes[cubes.length - 1].position.add(positionCalibration);
  scene.add(cubes[cubes.length - 1]);
}

function isWhithinBoundaries(testCoordX, testCoordY) {
  //test if collided with self 
  for (let i = 0; i < cubes.length - 1; i++) {
    if ((Math.round(cubes[i].position.x) == Math.round(testCoordX)) && (Math.round(cubes[i].position.y) == Math.round(testCoordY))) { return false; }
  }
  //test if collided with walls
  if ((testCoordX > Boundaries.left)
    && (testCoordX < Boundaries.right)
    && (testCoordY > Boundaries.down)
    && (testCoordY < Boundaries.up)) {
    return true;
  }
  else { return false; }
}

spawnSnake();

function spawnBall() {
  let snakeHeadCoords = cubes[cubes.length - 1].position.clone();
  let ballSpawnCooords = new THREE.Vector3(0, 0, 0);
  do {
    ballSpawnCooords.x = getRandomInt(plane.geometry.parameters.width) - plane.geometry.parameters.width / 2;
    ballSpawnCooords.y = getRandomInt(plane.geometry.parameters.height) - plane.geometry.parameters.height / 2;
    ballSpawnCooords.add(positionCalibration);
    ballSpawnCooords.z = Sizes.ballRadius;
  }
  while ((!isWhithinBoundaries(ballSpawnCooords.x, ballSpawnCooords.y)) || ((Math.round(ballSpawnCooords.x) == Math.round(snakeHeadCoords.x))
    && (Math.round(ballSpawnCooords.y) == Math.round(snakeHeadCoords.y))))
  ball.position.copy(ballSpawnCooords);
}

const ball = new THREE.Mesh(new THREE.SphereGeometry(Sizes.ballRadius, 32, 16), Materials.ball);
spawnBall();
scene.add(ball);

function onArrowKey(event) {
  let arrowKeyPressed = false;
  if (event.key === "a") {   
    arrowKeyPressed = true;
    speed.x = -speedValue;
    speed.y = 0;
  }
  if (event.key === "d") {   
    arrowKeyPressed = true;
    speed.x = speedValue;
    speed.y = 0;
  }
  if (event.key === "w") {  
    arrowKeyPressed = true;
    speed.y = speedValue;
    speed.x = 0;
  }
  if (event.key === "s") {   
    arrowKeyPressed = true;
    speed.y = -speedValue;
    speed.x = 0;
  }

  //initialize arrays only if first time key press
  if ((!GameState.running) && (arrowKeyPressed == true)) {
    GameState.running = true
    speeds.fill(speed.clone());
    GameState.intervalId = setInterval(move, 250);
  }
}

function checkCollisionWithBall() {
  let snakeHeadCoords = cubes[cubes.length - 1].position.clone();
  let ballCooords = ball.position.clone();
  if ((Math.round(ballCooords.x) == Math.round(snakeHeadCoords.x)) && (Math.round(ballCooords.y) == Math.round(snakeHeadCoords.y))) {
    grow();
    spawnBall();
  }
}

//the moving direction of each cube is stored in a corresponding 
//element of the speeds array and is the new speed propagates with every moving cycle.
function move() {
  speeds.push(speed.clone());
  speeds.shift();

  for (let i = (cubes.length - 1); i >= 0; i--) {
    cubes[i].position.add(speeds[i].clone().multiplyScalar(250));
  }

  if (!isWhithinBoundaries(cubes[cubes.length - 1].position.x, cubes[cubes.length - 1].position.y)) {
    const score = cubes.length;
    resetGameState();
    setTimeout((gameOver), 100, score);
    setTimeout((resetScene), 100);
    return;
  }
  checkCollisionWithBall();
}

//since the async alert function somehow interferes with frame rendering schedule 
//(also window switching and controling it with the mouse), 
//the only way to deal with the weird zooming out of camera is to only start rotation 
//after on manual user key press, after the first game over.
//ideally it would be after the user hits okay on alert, but as I understood the alert doesn't return anything.
function resetGameState()
{ 
  GameState.running = false;
  clearInterval(GameState.intervalId);
}

function gameOver(snakeLength) {
  alert("Game Over! \nSnake length: " + snakeLength);
}

function resetScene()
{ 
  cubes.forEach(cube => {
  scene.remove(cube);
  });
  camera.position.set(0, -7, 18);
  camera.lookAt(scene.position);
  controls.update();
  cubes = new Array(Sizes.defaultSnakeSize);
  speeds = new Array(cubes.length);
  spawnSnake();
  spawnBall();
}

function grow() {
  let newCube = new THREE.Mesh(cubeGeom, Materials.body);
  let newPosition = cubes[0].position.clone().add(speeds[0].clone().multiplyScalar(-1 * 250));
  newCube.position.copy(newPosition);
  cubes.unshift(newCube);
  speeds.unshift(speeds[0].clone());
  scene.add(cubes[0]);
}

document.addEventListener("keydown", onArrowKey);

function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
  controls.update();
}

render();

