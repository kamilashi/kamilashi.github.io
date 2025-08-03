const Globals = 
{
    mapSize: 100,
    waterVertxCount: 10,
    landOrigin: new THREE.Vector3(0.0, 0.0, 0.0),
    maxTreeCount: 20
}

let Params = {
    bgColor: '#0a96fb',
    waterSpeed: 0.02,
    landscapeSize: 10,
    landscapeResolution: 11, // needs to be odd and larger than 4! 5 for minimal testing
    landDisplacementScale: 1.5,
    defaultTreeScale: 1.5,
    spawnTrees: true
}

let landscapeDataBuffer;
let landColorBuffer;
let landDispBuffer;
let loadedTree = 0;
let loadStarted = false;
const treeSpawnRequests = [];


const modelLoader = new THREE.GLTFLoader();
const textureLoader = new THREE.TextureLoader();

// Initialize WebGL renderer
const canvas = document.getElementById("landscapeGenCanvas");
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setClearColor(Params.bgColor);  

// Create a new Three.js scene
const scene = new THREE.Scene();

// Add a camera
const camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 100);
camera.position.set(0, 14, 18);

const controls = new THREE.OrbitControls(camera, renderer.domElement);   
controls.enablePan = false;
controls.maxPolarAngle = Math.PI / 2.5;   // -72 deg
controls.minDistance = 5;
controls.maxDistance = 50;
controls.target.set(0, 2, 0);
controls.update();       

function getFlatIndex(posX, posY, width) {
  return posX + posY * width;
}

function isLand(posX, posY, width) {
  return landscapeDataBuffer[getFlatIndex(posX, posY, width)] == LandscapeType.LAND;
}

function isWater(posX, posY, width) {
  return landscapeDataBuffer[getFlatIndex(posX, posY, width)] == LandscapeType.WATER;
}

function getWorldPosition(posX, posY, worldHeight) {
  
  let root = new THREE.Vector3()
  root.copy(Globals.landOrigin);
  root.x -= Params.landscapeSize * 0.5;
  root.z -= Params.landscapeSize * 0.5;

  const segmentLength = Params.landscapeSize / (Params.landscapeResolution - 1);
  position = new THREE.Vector3(segmentLength * posX, worldHeight , segmentLength * posY);
  position.add(root);
  return position;
}

function getSquareType(posX, posY, width) {
  let mask = 0b000;
  if(isLand(posX-1, posY-1, width))
      {
        mask ^= (1 << SquareMask.UpLeft);
      }       
      if(isLand(posX+1, posY-1, width))
      {
        mask ^= (1 << SquareMask.UpRight);
      } 
      if(isLand(posX+1, posY+1, width))
      {
        mask ^= (1 << SquareMask.DownRight);
      }       
      if(isLand(posX-1, posY+1, width))
      {
        mask ^= (1 << SquareMask.DownLeft);
      } 
  return mask;
}

function requestSpawn(px, py, worldHeight, scaleWight)
{
  const randomizer = THREE.MathUtils.randFloat(0.7, 1);

  const position = getWorldPosition(px, py, worldHeight * Params.landDisplacementScale);
  const rotation = Math.random() * Math.PI * 2;
  const randomizedScale = randomizer * scaleWight * Params.defaultTreeScale;

  treeSpawnRequests.push({pos: position, rot: rotation, scale: randomizedScale});

  if(loadedTree){
    spawnTrees();
  }
  else if (!loadStarted){
    loadStarted = true;
    modelLoader.load('./models/low_poly_tree.glb', gltf => { 
    loadedTree = gltf.scene;  
    spawnTrees();
    });
  }
}

function spawnTrees()
{
  if (!loadedTree) return;

  while (treeSpawnRequests.length) {
    const { pos, rot, scale } = treeSpawnRequests.pop();

    const tree = loadedTree.clone(true);     
    tree.position.copy(pos);
    tree.scale.multiplyScalar(scale);              
    tree.rotation.y = rot;
    scene.add(tree);
  }
}

function fillSquare(mask, pivotPosX, pivotPosY, width) {
  const px = pivotPosX;
  const py = pivotPosY;

  switch (mask)
  {
    case 0: 
    {
      break;
    }
    case 1: // UpLeft
      {
        landscapeDataBuffer[getFlatIndex(px - 1, py, width)] = LandscapeType.COAST;
        landscapeDataBuffer[getFlatIndex(px, py - 1, width)] = LandscapeType.COAST;
        break;
      }
    case 2: // UpRight 
      {
        landscapeDataBuffer[getFlatIndex(px + 1, py, width)] = LandscapeType.COAST;
        landscapeDataBuffer[getFlatIndex(px, py - 1, width)] = LandscapeType.COAST;

        landscapeDataBuffer[getFlatIndex(px, py, width)] = LandscapeType.COAST;
        break;
      }
    case 3: // Up 
    case 12: // Down 
      {
        landscapeDataBuffer[getFlatIndex(px + 1, py, width)] = LandscapeType.COAST;
        landscapeDataBuffer[getFlatIndex(px-1, py, width)] = LandscapeType.COAST;
        landscapeDataBuffer[getFlatIndex(px, py, width)] = LandscapeType.COAST;

        down = mask == 12 ? 1 : -1;
        landscapeDataBuffer[getFlatIndex(px, py + down, width)] = LandscapeType.LAND;
        break;
      }
    case 4: // DownRight 
      {
        landscapeDataBuffer[getFlatIndex(px + 1, py, width)] = LandscapeType.COAST;
        landscapeDataBuffer[getFlatIndex(px, py + 1, width)] = LandscapeType.COAST;
        break;
      }
    case 5: //left up right down 
      {
        landscapeDataBuffer[getFlatIndex(px - 1, py, width)] = LandscapeType.COAST;
        landscapeDataBuffer[getFlatIndex(px, py - 1, width)] = LandscapeType.COAST;
        landscapeDataBuffer[getFlatIndex(px + 1, py, width)] = LandscapeType.COAST;
        landscapeDataBuffer[getFlatIndex(px, py + 1, width)] = LandscapeType.COAST;
        break;
      }
    case 6: // Right 
    case 9: // Left 
      {
        landscapeDataBuffer[getFlatIndex(px, py - 1, width)] = LandscapeType.COAST;
        landscapeDataBuffer[getFlatIndex(px, py + 1, width)] = LandscapeType.COAST;
        landscapeDataBuffer[getFlatIndex(px, py, width)] = LandscapeType.COAST;

        right = mask == 6 ? 1 : -1;
        landscapeDataBuffer[getFlatIndex(px + right, py, width)] = LandscapeType.LAND;
        break;
      }
    case 7: // UpRightTriangle 
      {
        landscapeDataBuffer[getFlatIndex(px - 1, py, width)] = LandscapeType.COAST;
        landscapeDataBuffer[getFlatIndex(px, py + 1, width)] = LandscapeType.COAST;

        landscapeDataBuffer[getFlatIndex(px, py, width)] = LandscapeType.COAST;

        landscapeDataBuffer[getFlatIndex(px, py - 1, width)] = LandscapeType.LAND;
        landscapeDataBuffer[getFlatIndex(px + 1, py, width)] = LandscapeType.LAND;
        break;
      }   
    case 8: // Left Down 
      {
        landscapeDataBuffer[getFlatIndex(px - 1, py, width)] = LandscapeType.COAST;
        landscapeDataBuffer[getFlatIndex(px, py + 1, width)] = LandscapeType.COAST;
        landscapeDataBuffer[getFlatIndex(px, py, width)] = LandscapeType.COAST;
        break;
      }   
    case 10: //left down right up diag 
      {
        landscapeDataBuffer[getFlatIndex(px - 1, py, width)] = LandscapeType.COAST;
        landscapeDataBuffer[getFlatIndex(px, py + 1, width)] = LandscapeType.COAST;
        
        landscapeDataBuffer[getFlatIndex(px, py, width)] = LandscapeType.COAST;

        landscapeDataBuffer[getFlatIndex(px, py - 1, width)] = LandscapeType.COAST;
        landscapeDataBuffer[getFlatIndex(px + 1, py, width)] = LandscapeType.COAST;
        break;
      }
    case 11: // UpLeftTriangle 
      {
        landscapeDataBuffer[getFlatIndex(px + 1, py, width)] = LandscapeType.COAST;
        landscapeDataBuffer[getFlatIndex(px, py + 1, width)] = LandscapeType.COAST;

        landscapeDataBuffer[getFlatIndex(px, py, width)] = LandscapeType.LAND;
        landscapeDataBuffer[getFlatIndex(px, py - 1, width)] = LandscapeType.LAND;
        landscapeDataBuffer[getFlatIndex(px - 1, py, width)] = LandscapeType.LAND;

        if(Params.spawnTrees)
        {
          requestSpawn(px, py, Globals.landOrigin.y + LandscapeDataLookup[LandscapeType.LAND].height, 1.0);
          requestSpawn(px, py - 1, Globals.landOrigin.y + LandscapeDataLookup[LandscapeType.LAND].height, 0.5);
          requestSpawn(px - 1, py, Globals.landOrigin.y + LandscapeDataLookup[LandscapeType.LAND].height, 0.5);
        }
        break;
      }
    case 13: // DownLeftTriangle 
      {
        landscapeDataBuffer[getFlatIndex(px + 1, py, width)] = LandscapeType.COAST;
        landscapeDataBuffer[getFlatIndex(px, py - 1, width)] = LandscapeType.COAST;

        landscapeDataBuffer[getFlatIndex(px, py, width)] = LandscapeType.COAST;

        landscapeDataBuffer[getFlatIndex(px - 1, py, width)] = LandscapeType.LAND;
        landscapeDataBuffer[getFlatIndex(px, py + 1, width)] = LandscapeType.LAND;

        break;
      }
    case 14: // DownRightTriangle 
      {
        landscapeDataBuffer[getFlatIndex(px - 1, py, width)] = LandscapeType.COAST;
        landscapeDataBuffer[getFlatIndex(px, py - 1, width)] = LandscapeType.COAST;

        landscapeDataBuffer[getFlatIndex(px, py, width)] = LandscapeType.LAND;
        landscapeDataBuffer[getFlatIndex(px + 1, py, width)] = LandscapeType.LAND;
        landscapeDataBuffer[getFlatIndex(px, py + 1, width)] = LandscapeType.LAND;

        if(Params.spawnTrees)
        {
          requestSpawn(px, py, Globals.landOrigin.y + LandscapeDataLookup[LandscapeType.LAND].height, 1.0);
          requestSpawn(px + 1, py, Globals.landOrigin.y + LandscapeDataLookup[LandscapeType.LAND].height, 0.5);
          requestSpawn(px, py + 1, Globals.landOrigin.y + LandscapeDataLookup[LandscapeType.LAND].height, 0.5);
        }

        break;
      }  
    case 15: // all land 
      {
        landscapeDataBuffer[getFlatIndex(px, py, width)] = LandscapeType.LAND;
        landscapeDataBuffer[getFlatIndex(px-1, py, width)] = LandscapeType.LAND; 
        landscapeDataBuffer[getFlatIndex(px+1, py, width)] = LandscapeType.LAND; 
        landscapeDataBuffer[getFlatIndex(px, py-1, width)] = LandscapeType.LAND; 
        landscapeDataBuffer[getFlatIndex(px, py+1, width)] = LandscapeType.LAND; 

        if(Params.spawnTrees)
        {
          requestSpawn(px, py, Globals.landOrigin.y + LandscapeDataLookup[LandscapeType.LAND].height, 1.0);
          requestSpawn(px + 1, py, Globals.landOrigin.y + LandscapeDataLookup[LandscapeType.LAND].height, 0.5);
          requestSpawn(px - 1, py, Globals.landOrigin.y + LandscapeDataLookup[LandscapeType.LAND].height, 0.5);
          requestSpawn(px, py + 1, Globals.landOrigin.y + LandscapeDataLookup[LandscapeType.LAND].height, 0.5);
          requestSpawn(px, py - 1, Globals.landOrigin.y + LandscapeDataLookup[LandscapeType.LAND].height, 0.5);
        }

        break;
      }
    default: break;
  }
}


const LandscapeType = {
    WATER: 0,
    LAND: 1,
    COAST: 2,
    COUNT: 3
};

const SquareMask = {
    UpLeft: 0,
    UpRight: 1,
    DownRight: 2,
    DownLeft: 3
};

let LandscapeData = 
{
  type : LandscapeType.WATER,
}

const LandscapeDataLookup = [
            { height: -1, color: new THREE.Color().set('#606060'), options : [LandscapeType.WATER, LandscapeType.COAST] },
            { height: 1, color: new THREE.Color().set('#04743a'), options : [LandscapeType.LAND, LandscapeType.COAST] },
            { height: -0.1, color: new THREE.Color().set('#b19756'), options : [LandscapeType.WATER, LandscapeType.LAND] }
        ];

function generateLandscapeData()
{
  const landscapeDataSize = Params.landscapeResolution * Params.landscapeResolution;
  const width = Params.landscapeResolution;
  landscapeDataBuffer = new Int8Array(landscapeDataSize).fill(LandscapeType.WATER);

  // generate land to draw the outline around
   for (let i = 1; i < width -1; i+=2) {
    for (let j = 1; j < width -1; j+=2) {
    landscapeDataBuffer[getFlatIndex(i, j, width)] = THREE.MathUtils.randInt(LandscapeType.WATER, LandscapeType.LAND); 
    }
  } 

  // draw outlines
  for (let i = 2; i < width -2; i+=2) {
    for (let j = 2; j < width -2; j+=2) {

      let mask = getSquareType(i, j, width); 

     // console.log(mask);

      fillSquare(mask, i, j, width);
    }
  }  

  // handle edges
   for (let i = 0; i < width; i++) {
    // left
    landscapeDataBuffer[getFlatIndex(0, i, width)] = isLand(1, i, width) 
                                                  || getSquareType(0, i, width) == 2 ? 
                                                  LandscapeType.COAST : LandscapeType.WATER; 
    // right
    landscapeDataBuffer[getFlatIndex(width - 1, i, width)] = isLand(width - 2, i, width) 
                                                          || getSquareType(width - 1, i, width) == 8 ? 
                                                          LandscapeType.COAST : LandscapeType.WATER; 
  }
  
  for (let i = 0; i < width; i++) {
    // up
    landscapeDataBuffer[getFlatIndex(i, 0, width)] = isLand(i, 1, width) 
                                                  || getSquareType(i, 0, width) == 8 ? 
                                                  LandscapeType.COAST : LandscapeType.WATER; 
    // down
    landscapeDataBuffer[getFlatIndex(i, width - 1, width)] = isLand(i, width - 2, width) 
                                                          || getSquareType(i, width - 1, width) == 2 ? 
                                                          LandscapeType.COAST : LandscapeType.WATER; 
  }
}

generateLandscapeData();

function assignLandscapeData(geometry)
{
  const vCount = geometry.attributes.position.count;

   landColorBuffer  = new Float32Array(vCount * 3);   
   landDispBuffer   = new Float32Array(vCount);      

  for (let i = 0; i < landscapeDataBuffer.length; i++) {
    let landType = landscapeDataBuffer[i];
    landDispBuffer[i] = LandscapeDataLookup[landType].height;

    landColorBuffer[i * 3 + 0] = LandscapeDataLookup[landType].color.r;
    landColorBuffer[i * 3 + 1] = LandscapeDataLookup[landType].color.g;
    landColorBuffer[i * 3 + 2] = LandscapeDataLookup[landType].color.b;
  }

  geometry.setAttribute('aColor',        new THREE.BufferAttribute(landColorBuffer, 3));
  geometry.setAttribute('aHeight',       new THREE.BufferAttribute(landDispBuffer,   1));

  geometry.attributes.aColor.needsUpdate = true;
  geometry.attributes.aHeight.needsUpdate = true;
}

// light the scene
scene.add(new THREE.AmbientLight('#606060'));
const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
scene.add(directionalLight);

const normalTex = textureLoader.load('./textures/waternormal.jpg');
normalTex.wrapS = normalTex.wrapT = THREE.RepeatWrapping;

const invertedRadialAlphaTex = textureLoader.load('./textures/invertedradialalpha.jpg');
  
function getLightDirection(position) {
  toLight = directionalLight.position.clone();
  toLight.sub(position);
  toLight.normalize();
  return toLight;
}

const Materials = {
  waterCustom: new THREE.ShaderMaterial( {

    uniforms: {  
      uNormalMap: { value: normalTex },
      uTime:      { value: 0.0 },          
      uSpeed:     { value: Params.waterSpeed }, 
      uScale:     { value: 3.0 },
      
      uLightDir:    { value: new THREE.Vector3(1, 1, 1).normalize() },
      uLightColor:  { value: new THREE.Color('#348dcd') },
      uDarkColor:   { value: new THREE.Color('#34cdc3') }
    },

    vertexShader: document.getElementById( 'waterVert' ).textContent,
    fragmentShader: document.getElementById( 'waterFrag' ).textContent

  } ),

  landCustom: new THREE.ShaderMaterial( {

    uniforms: {  
      uDispScale: { value: Params.landDisplacementScale }  
    },

    vertexShader: document.getElementById( 'landVert' ).textContent,
    fragmentShader: document.getElementById( 'landFrag' ).textContent
  } ),

  cover: new THREE.MeshBasicMaterial({ color: new THREE.Color(Params.bgColor), transparent:true, alphaMap: invertedRadialAlphaTex})
}

for (const [key, value] of Object.entries(Materials)) {
  value.side = THREE.DoubleSide;
}

// create water
const waterGeometry = new THREE.PlaneGeometry(Globals.mapSize, Globals.mapSize, Globals.waterVertxCount -1, Globals.waterVertxCount -1);
const waterMesh = new THREE.Mesh(waterGeometry, Materials.waterCustom);
waterMesh.position.set(0, 0, 0);
waterMesh.rotation.set(-Math.PI/2, 0, 0);
scene.add( waterMesh );

// create cover
const coverGeometry = new THREE.PlaneGeometry(Globals.mapSize, Globals.mapSize, 1, 1);
const coverMesh = new THREE.Mesh(coverGeometry, Materials.cover);
coverMesh.position.set(0, 1.0, 0);
coverMesh.rotation.set(-Math.PI/2, 0, 0);
scene.add( coverMesh );

// create land
const landGeometry = new THREE.PlaneGeometry(Params.landscapeSize, Params.landscapeSize, Params.landscapeResolution -1, Params.landscapeResolution -1);
const landMesh = new THREE.Mesh(landGeometry, Materials.landCustom);
landMesh.position.set(Globals.landOrigin.x, Globals.landOrigin.y, Globals.landOrigin.z);
landMesh.rotation.set(-Math.PI/2, 0, 0);
scene.add( landMesh );

assignLandscapeData(landGeometry);

const clock = new THREE.Clock();

// Render the scene
function render() {
  requestAnimationFrame(render);

  Materials.waterCustom.uniforms.uLightDir.value = getLightDirection(waterMesh.position);
  Materials.waterCustom.uniforms.uTime.value = clock.getElapsedTime();
  Materials.waterCustom.uniforms.uSpeed.value = Params.waterSpeed;
  Materials.landCustom.uniforms.uDispScale.value = Params.landDisplacementScale;
  
  renderer.render(scene, camera);
  controls.update();
}
render();

