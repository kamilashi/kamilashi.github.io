// Initialize WebGL renderer
const canvas = document.getElementById("clockCanvas");
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setClearColor('black');  // background color

// Create a new Three.js scene
const scene = new THREE.Scene();

// Add a camera
const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 500);
camera.position.set(0, 2, 10);

const controls = new THREE.OrbitControls(camera, renderer.domElement);

const Materials = {
  clockFace: new THREE.MeshStandardMaterial({ color: 'white' }),
  clockOuterFrame: new THREE.MeshStandardMaterial({ color: 'skyblue' }),
  tick: new THREE.MeshStandardMaterial({ color: 'black' }),
  black: new THREE.MeshStandardMaterial({ color: 'black' }),
  blob: new THREE.MeshStandardMaterial({ color: 'darkred' }),
  handGrey:  new THREE.MeshStandardMaterial({ color: 'grey' }),
  handBlue: new THREE.MeshStandardMaterial({ color: 'darkblue' }),
}

for (const [key, value] of Object.entries(Materials)) {
  value.side = THREE.DoubleSide;
}

//draw clock 
const clockFaceGeometry = new THREE.CylinderGeometry(5, 5, 0.3, 60);
const clockFace = new THREE.Mesh(clockFaceGeometry, Materials.clockFace);
clockFace.rotation.set(0, Math.PI / 2, Math.PI / 2);
clockFace.position.set(0, 0, 0);
scene.add(clockFace);

//define tick geometries
const smallTickGeometry = new THREE.PlaneGeometry(0.1, 0.7);
const smallTickRadius = clockFace.geometry.parameters.radiusTop - smallTickGeometry.parameters.height / 2;
const smallTicksFront = new Array(60);
const smallTicksBack = new Array(60);
generateTicks(smallTickGeometry, 60, smallTickRadius, smallTicksFront, 1);
generateTicks(smallTickGeometry, 60, smallTickRadius, smallTicksBack, 0);

const largeTickGeometry = new THREE.PlaneGeometry(0.2, 1);
const largeTickRadius = clockFace.geometry.parameters.radiusTop - largeTickGeometry.parameters.height / 2;
const largeTicksFront = new Array(12);
const largeTicksBack = new Array(12);
generateTicks(largeTickGeometry, 12, largeTickRadius, largeTicksFront, 1);
generateTicks(largeTickGeometry, 12, largeTickRadius, largeTicksBack, 0);

// parameters:
// geometry: source tick geometry
// count: number of ticks - 12 or 60
// radius for the tick pivot calculation, close to the outer edge of the clock face
// array to access the ticks later
// isFront: 1 if front face, 0 if back face
function generateTicks(geometry, count, radius, array, isFront) { 
  for (let i = 1; i <= count; i++) {
    const tick = new THREE.Mesh(geometry, Materials.tick);
    tick.position.set(0, 0, (2*isFront - 1) * (clockFace.geometry.parameters.height / 2 + 0.01)); 
    const rotAngle = i * 2 * Math.PI / count;
    const pivotX = radius * Math.sin(rotAngle);
    const pivotY = radius * Math.cos(rotAngle);
    const newPivotPos = new THREE.Vector3(pivotX, pivotY, 0);
    tick.position.add(newPivotPos);
    tick.rotation.set(0, 0, -rotAngle);
    array[i-1] = tick;
    scene.add(tick);
  }
}

// mark the 12 o'clock ticks - front and back
largeTicksFront[11].material = Materials.clockOuterFrame;
largeTicksFront[11].position.z += 0.011;
largeTicksBack[11].material = Materials.clockOuterFrame;
largeTicksBack[11].position.z -= 0.011;

// add the protective ring
Materials.clockOuterFrame.flatShading = true;
const ringHeight = clockFace.geometry.parameters.height/2+0.1;
const points = [ new THREE.Vector2(5, -ringHeight), new THREE.Vector2(5.5, -ringHeight),  new THREE.Vector2(5.5, ringHeight),new THREE.Vector2(5, ringHeight), new THREE.Vector2(5, -ringHeight)];
const clockOuterGeometry = new THREE.LatheGeometry( points , 300);
const clockOuterFrame = new THREE.Mesh( clockOuterGeometry, Materials.clockOuterFrame );
clockOuterFrame.rotation.set(Math.PI / 2, 0, 0);
scene.add( clockOuterFrame );

// add center blobs
const blobGeometry = new THREE.SphereGeometry(0.3, 32, 32);
const blobFront = new THREE.Mesh( blobGeometry, Materials.blob );
const blobBack = new THREE.Mesh( blobGeometry, Materials.blob );
blobFront.position.set(0, 0, clockFace.geometry.parameters.height / 2 );
blobBack.position.set(0, 0, - (clockFace.geometry.parameters.height / 2 ));
scene.add( blobFront );
scene.add( blobBack );

// front face hands
const secondHandGeometry = new THREE.PlaneGeometry(0.1, 4.5);
const secondHandFront = new THREE.Mesh( secondHandGeometry, Materials.handGrey );
secondHandFront.position.set(0, 0, clockFace.geometry.parameters.height / 2 + 0.03);
scene.add(secondHandFront);

const minuteHandGeometry = new THREE.SphereGeometry(0.3, 32, 32);
const minuteHandFront = new THREE.Mesh( blobGeometry, Materials.black );
minuteHandFront.scale.set(0.4, 7, 0.2);
minuteHandFront.position.set(0, 0, clockFace.geometry.parameters.height / 2 + 0.02);
scene.add( minuteHandFront );

const hourHandGeometry = new THREE.SphereGeometry(0.3, 32, 32);
const hourHandFront = new THREE.Mesh( blobGeometry, Materials.black );
hourHandFront.scale.set(0.4, 5, 0.2);
hourHandFront.position.set(0, 0, clockFace.geometry.parameters.height / 2 + 0.02);
scene.add( hourHandFront );

// back face hands
const secondHandBack = new THREE.Mesh( secondHandGeometry, Materials.handGrey );
secondHandBack.position.set(0, 0, -1 * (clockFace.geometry.parameters.height / 2 + 0.03));
scene.add(secondHandBack);

const minuteHandBack = new THREE.Mesh( blobGeometry, Materials.black );
minuteHandBack.scale.set(0.4, 7, 0.2);
minuteHandBack.position.set(0, 0, -1 * (clockFace.geometry.parameters.height / 2 + 0.02));
scene.add( minuteHandBack );

const hourHandBack = new THREE.Mesh( blobGeometry, Materials.black );
hourHandBack.scale.set(0.4, 5, 0.2);
hourHandBack.position.set(0, 0, -1 * (clockFace.geometry.parameters.height / 2 + 0.02));
scene.add( hourHandBack );

scene.add(new THREE.AmbientLight('#606060'));
const light = new THREE.PointLight();
light.position.set(-10, 0, 10);
scene.add(light);


function moveHandTo(radius, hand, time, steps, isFront)
{
    const rotAngle =  (2 * Math.PI / steps ) * time;
    const pivotX =  radius * (Math.sin((2*isFront-1) * rotAngle)) ;
    const pivotY =  radius * (Math.cos((2*isFront-1) * rotAngle)) ;
    const newPivotPos = new THREE.Vector3(pivotX, pivotY, hand.position.z);
    hand.position.copy(newPivotPos);
    hand.rotation.set(0, 0, -1 * (2*isFront-1) * rotAngle );
}
const TIME = {
  second: 0,
  minute: 0,
  hour: 0,
  secondHandRadius: secondHandFront.geometry.parameters.height / 2,
  minuteHandRadius: (minuteHandFront.scale.y * 2 * minuteHandFront.geometry.parameters.radius)/2,
  hourHandRadius: (hourHandFront.scale.y * 2 * hourHandFront.geometry.parameters.radius)/2,
}

function updateClock()
{
  if(TIME.minute==60)
  {
    TIME.minute=0;
    TIME.hour+=1;
    moveHandTo(TIME.hourHandRadius,hourHandFront, TIME.hour, 12,1);
    moveHandTo(TIME.hourHandRadius,hourHandBack, TIME.hour, 12,0);
    if(TIME.hour==12)
    {
    TIME.hour=0;
    }
  }

  if(TIME.second==60)
  {
    TIME.second=0;
    TIME.minute+=1;
    moveHandTo(TIME.minuteHandRadius, minuteHandFront, TIME.minute, 60, 1);
    moveHandTo(TIME.minuteHandRadius, minuteHandBack, TIME.minute, 60, 0);
  }
  TIME.second+=1;
  moveHandTo(TIME.secondHandRadius,secondHandFront, TIME.second, 60, 1);
  moveHandTo(TIME.secondHandRadius,secondHandBack, TIME.second, 60, 0);
}

function initClock(hourHand, minuteHand, secondHand, isFront)
{
  moveHandTo(TIME.secondHandRadius, secondHand, TIME.second, 60,isFront);
  moveHandTo(TIME.minuteHandRadius,minuteHand, TIME.minute, 60,isFront);
  moveHandTo(TIME.hourHandRadius,hourHand, TIME.hour, 12, isFront);
}

const date = new Date();
TIME.second = date.getSeconds();
TIME.minute = date.getMinutes();
TIME.hour = date.getHours();
initClock(hourHandFront, minuteHandFront, secondHandFront, 1); // front face
initClock(hourHandBack, minuteHandBack, secondHandBack, 0); // back face
setInterval(updateClock, 1000);

// Render the scene
function render() {
  requestAnimationFrame(render);

  renderer.render(scene, camera);
  controls.update();
}
render();

