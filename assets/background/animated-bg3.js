(() => {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || !window.THREE) {
    console.log("No THREE.js!");
    return;
  }

  const cardEl = document.getElementById('project-card');

  function showCard(entryId) {
    const tpl = document.getElementById(entryId);
    if (!tpl) return;

    cardEl.replaceChildren(tpl.content.cloneNode(true)); // swap contents

    cardEl.hidden = false;
    cardEl.dataset.open = "true";
    cardEl.setAttribute('aria-hidden', 'false');
  }

  function hideCard() {
    cardEl.dataset.open = "false";
    setTimeout(() => {
      cardEl.hidden = true;
      cardEl.setAttribute('aria-hidden', 'true');
    }, 130);
  }

  function tryOpenCard()
  {
    if(cardEl.hidden == true) return;

    const link = cardEl.querySelector('a[href]');
    if (link) {
      console.log("Card link:", link.href);
      // open in new tab
      window.open(link.href);
    }
  }

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true 
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;      

  const raycaster = new THREE.Raycaster();
  const mousePos = new THREE.Vector2();

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    100
  );

  // composer
  //const fxaaPass = new THREE.ShaderPass(THREE.FXAAShader);
  const composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene, camera));
  //composer.addPass(outlinePass);
  //composer.addPass(fxaaPass);
  
  const clock = new THREE.Clock();
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enabled = true;

  camera.position.set(-1, 1.5, 2);
  controls.target.set(0, 0.5, 0.5);

  const Params =
  {
    bgColor: 'gray',
    cabinetSize: 0.5,
    cabinetDepthMultiplier: 1.4,
    cabinetsSpacing: 0.01,
    cabinetShellScaleMultiplier: 1.1,
    entriesCount: [4,8], // sync with the site data!
    sectionsCount: 2, // sync with the site data!
    titleTopMargin: 0.1,
    titleXOffsetStep: 0.17,
    entryHoverShiftDistance: 0.2,
    entryHoverShiftDuration: 0.2,
    cabinetHoverShiftDuration: 1.0,
  }

  const Layers =
  {
    entries: 1,
    sections: 2
  }

  function runSymmetricalAnimation(obj, direction)
  {
      const localTime = THREE.MathUtils.clamp(obj.userData.actions.hoverIn.time, 0, Params.entryHoverShiftDuration);
      obj.userData.actions.hoverIn.timeScale = direction;
      obj.userData.actions.hoverIn.time = localTime;
      obj.userData.actions.hoverIn.paused = false;
      obj.userData.actions.hoverIn.play();
  }

  const HoverHandlers = {
  [Layers.entries]: {
    onHoverIn:  (obj) => { 
      runSymmetricalAnimation(obj, 1);
      showCard(obj.userData.id);
     },
    onHoverOut: (obj) => { 
      runSymmetricalAnimation(obj, -1); 
    }  
    },
  [Layers.sections]: {
    onHoverIn:  (obj) => { 
      runSymmetricalAnimation(obj, 1); 
      obj.userData.entrySensors.forEach(sensor => {
        sensor.scale.y = 1;
      });
    },
    onHoverOut: (obj) => { 
      runSymmetricalAnimation(obj, -1); 
      obj.userData.entrySensors.forEach(sensor => {
        sensor.scale.y = 0;
      });}  
    },
  };

  const Materials = {
    default: new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: false, transparent: false }),
    text: new THREE.MeshBasicMaterial({ color: 0x000000 }),
    sensor: new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: false, transparent: true, opacity: 0 }),
  }

  const entryGeometry = new THREE.PlaneGeometry( Params.cabinetSize * 0.95, Params.cabinetSize );
  entryGeometry.translate(0, entryGeometry.parameters.height * 0.5, 0);

  const entrySensorGeometry = new THREE.PlaneGeometry( Params.cabinetSize, Params.cabinetSize + Params.entryHoverShiftDistance );
  entrySensorGeometry.translate(0, entrySensorGeometry.parameters.height * 0.5, 0);

  const cabinetDelimeterGeometry = new THREE.BoxGeometry( Params.cabinetSize, Params.cabinetsSpacing, Params.cabinetSize);
  cabinetDelimeterGeometry.translate(0, cabinetDelimeterGeometry.parameters.height * 0.5, cabinetDelimeterGeometry.parameters.depth * 0.5);

  const cabinetTopGeometry = new THREE.BoxGeometry( Params.cabinetSize, Params.cabinetsSpacing, Params.cabinetSize);
  cabinetTopGeometry.translate(0, cabinetDelimeterGeometry.parameters.height * 0.5, -cabinetDelimeterGeometry.parameters.depth * 0.5);

  const cabinetBackGeometry = new THREE.BoxGeometry( Params.cabinetsSpacing, Params.cabinetSize, Params.cabinetSize);
  cabinetBackGeometry.translate(0, cabinetBackGeometry.parameters.height * 0.5, cabinetBackGeometry.parameters.depth * 0.5);
  
  const cabinetSidesGeometry = new THREE.BoxGeometry( Params.cabinetsSpacing, Params.cabinetSize, Params.cabinetSize);
  cabinetSidesGeometry.translate(0, cabinetBackGeometry.parameters.height * 0.5, - cabinetBackGeometry.parameters.depth * 0.5);

  const cabinetSensorGeometry = new THREE.BoxGeometry( Params.cabinetSize + 0.01, Params.cabinetSize, Params.cabinetSize * 0.8 /*  * 2.0 */); 
  cabinetSensorGeometry.translate(0, cabinetSensorGeometry.parameters.height * 0.5, cabinetSensorGeometry.parameters.depth * 0.5);

  let entriesCount = 0;
  Params.entriesCount.forEach(count => entriesCount += count);
  
  const cabinetHalfSize = Params.cabinetSize * 0.5;

  let entries = new Array(entriesCount);
  let sections = new Array(Params.sectionsCount);
  
  const { times: entryKfTimes, values: entryKfValues } = getKeyFramesWRate(Params.entryHoverShiftDuration, 120, easeOutCubic, Params.entryHoverShiftDistance);
  const entryShiftPos = convertD([0.0, 1.0, 0.0], entryKfValues);
  const entryShiftUpKF = new THREE.VectorKeyframeTrack(
    ".position",
    entryKfTimes,
    entryShiftPos
  );
  const entryHoverInClip = new THREE.AnimationClip("entry-hover-in", -1, [
    entryShiftUpKF
  ]);

const { times: cabinetKfTimes, values: cabinetKfValues } = getKeyFramesWRate(Params.cabinetHoverShiftDuration, 120, easeOutElastic, 1.0);
const cabinetShiftPos =  convertD([0.0, 0.0, Params.cabinetSize], cabinetKfValues);
const {  values: cabinetScaleValues } = getKeyFramesWRate(Params.cabinetHoverShiftDuration, 120, easeOutElastic, 1.0);
const cabinetGrowScale =  convertD([0.0, 0.0, 0.1], cabinetScaleValues, 1.0);
const cabinetShiftForwardKF = new THREE.VectorKeyframeTrack(
    ".position",
    cabinetKfTimes,
    cabinetShiftPos
  );
const cabinetGrowZKF = new THREE.VectorKeyframeTrack(
    ".scale",
    cabinetKfTimes,
    cabinetGrowScale
  );
const cabinetHoverInClip = new THREE.AnimationClip("section-hover-in", -1, [
    cabinetShiftForwardKF, cabinetGrowZKF
  ]);

  cabinetShellSideLeftModel = new THREE.Mesh(cabinetSidesGeometry, Materials.default);
  cabinetShellSideLeftModel.position.set(-cabinetHalfSize - Params.cabinetsSpacing * 0.5, -Params.cabinetsSpacing, 0.0);
  cabinetShellSideLeftModel.scale.x *= Params.cabinetShellScaleMultiplier;
  cabinetShellSideLeftModel.scale.y *= Params.sectionsCount;
  cabinetShellSideLeftModel.scale.y += (Params.sectionsCount+4) * Params.cabinetsSpacing;

  cabinetShellSideRightModel = new THREE.Mesh(cabinetSidesGeometry, Materials.default);
  cabinetShellSideRightModel.position.set(cabinetHalfSize + Params.cabinetsSpacing * 0.5, -Params.cabinetsSpacing, 0.0);
  cabinetShellSideRightModel.scale.set(cabinetShellSideLeftModel.scale.x, cabinetShellSideLeftModel.scale.y, cabinetShellSideLeftModel.scale.z);
  
  cabinetShellBackModel = new THREE.Mesh(cabinetBackGeometry, Materials.default);
  cabinetShellBackModel.position.set(-cabinetHalfSize, -Params.cabinetsSpacing, 0);
  cabinetShellBackModel.rotateY(Math.PI / 2);
  cabinetShellBackModel.scale.set(cabinetShellSideLeftModel.scale.x, cabinetShellSideLeftModel.scale.y, cabinetShellSideLeftModel.scale.z);

  cabinetShellSideLeftModel.scale.z *= Params.cabinetDepthMultiplier;
  cabinetShellSideRightModel.scale.z = cabinetShellSideLeftModel.scale.z;

  cabinetShellSideLeftModel.position.z += Params.cabinetSize + 0.005;
  cabinetShellSideRightModel.position.z = cabinetShellSideLeftModel.position.z;
 
  cabinetShellTopModel = new THREE.Mesh(cabinetTopGeometry, Materials.default);
  cabinetShellTopModel.position.set(0, Params.sectionsCount * Params.cabinetSize + (Params.sectionsCount-1) * Params.cabinetsSpacing, 0);
  cabinetShellTopModel.scale.z *= Params.cabinetDepthMultiplier;
  cabinetShellTopModel.position.z = cabinetShellSideLeftModel.position.z;

  scene.add(cabinetShellSideLeftModel);
  scene.add(cabinetShellSideRightModel);
  scene.add(cabinetShellBackModel);
  scene.add(cabinetShellTopModel);

  let i = 0;

  for(let sIdx = 0; sIdx < Params.sectionsCount; sIdx++)
  {
    const maxIndex =  Params.sectionsCount - 1;
    const cabinetPosition = new THREE.Vector3(0, (maxIndex - sIdx) * (Params.cabinetSize + Params.cabinetsSpacing), 0);
    sections[sIdx] = new THREE.Mesh(cabinetSensorGeometry, Materials.sensor);
    sections[sIdx].name = "section" + sIdx;
    sections[sIdx].position.set(cabinetPosition.x, cabinetPosition.y, cabinetPosition.z);

    cabinetFloorModel = new THREE.Mesh(cabinetDelimeterGeometry, Materials.default);
    cabinetFloorModel.position.set(0, 0.0, 0.0);

    cabinetShellDelimeter = new THREE.Mesh(cabinetDelimeterGeometry, Materials.default);
    cabinetShellDelimeter.position.set(0, 0.0, 0.0);
    cabinetShellDelimeter.position.z += 0.005;
    cabinetShellDelimeter.position.y = sIdx * Params.cabinetSize;

    scene.add(cabinetShellDelimeter);

    const cabinetDepth = Params.cabinetDepthMultiplier * Params.cabinetSize;
    cabinetSideLeftModel = new THREE.Mesh(cabinetSidesGeometry, Materials.default);
    cabinetSideLeftModel.scale.z *= Params.cabinetDepthMultiplier;
    cabinetSideLeftModel.position.set(-cabinetHalfSize, 0.0, Params.cabinetSize);
    cabinetSideRightModel = new THREE.Mesh(cabinetSidesGeometry, Materials.default);
    cabinetSideRightModel.position.set(cabinetHalfSize, 0.0, Params.cabinetSize);
    cabinetSideRightModel.scale.z *= Params.cabinetDepthMultiplier;

    cabinetFrontModel = new THREE.Mesh(cabinetBackGeometry, Materials.default);
    cabinetFrontModel.position.set(-cabinetHalfSize, 0.0, Params.cabinetSize - Params.cabinetsSpacing * 0.5);
    cabinetFrontModel.rotateY(Math.PI / 2);

    cabinetFloorModel.add(cabinetSideLeftModel);
    cabinetFloorModel.add(cabinetSideRightModel);
    cabinetFloorModel.add(cabinetFrontModel);

    const mixer = new THREE.AnimationMixer(cabinetFloorModel);

    sections[sIdx].userData.model = cabinetFloorModel;
    sections[sIdx].userData.mixer = mixer;
    sections[sIdx].userData.actions = 
    {
      hoverIn: mixer.clipAction(cabinetHoverInClip),
    };
    
    sections[sIdx].userData.actions.hoverIn.loop = THREE.LoopOnce;
    sections[sIdx].userData.actions.hoverIn.clampWhenFinished = true;

    sections[sIdx].add(cabinetFloorModel);

    sections[sIdx].userData.entrySensors = new Array(Params.entriesCount[sIdx]);

    scene.add(sections[sIdx]);

    const entriesSpacing = Params.cabinetSize / Params.entriesCount[sIdx];

    for (let eIdx = 0; eIdx < Params.entriesCount[sIdx]; eIdx++) {

      entries[i] = new THREE.Mesh(entrySensorGeometry, Materials.sensor);
      entries[i].scale.y = 0; 
      entries[i].name = "sec" + sIdx + "_entry"+eIdx;
      entries[i].position.set(0, 0.0, Params.cabinetSize - entriesSpacing * (0.5 + eIdx));

      entryModel = new THREE.Mesh(entryGeometry, Materials.default);
      
      entryModel.position.set(0, 0, 0);
      const mixer = new THREE.AnimationMixer(entryModel);
        
      entries[i].userData.model = entryModel;
      entries[i].userData.mixer = mixer;
      entries[i].userData.actions = 
      {
        hoverIn: mixer.clipAction(entryHoverInClip),
      };

      entries[i].userData.actions.hoverIn.loop = THREE.LoopOnce;
      entries[i].userData.actions.hoverIn.clampWhenFinished = true;
      entries[i].userData.id = `s${sIdx}e${eIdx}`
      entries[i].add(entryModel);

      sections[sIdx].userData.entrySensors[eIdx] = entries[i];
      sections[sIdx].userData.model.add(entries[i]);
      
      i += 1;
    }
  }

	renderer.setAnimationLoop( animate );
  
  scene.add(new THREE.AmbientLight('#606060'));
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 10, 20);
  scene.add(light);

  renderer.setClearColor(Params.bgColor);  

  let lastHoveredItem = { item: null, handlerId: null};
  let lastHoveredStickyItem = { item: null, handlerId: null};
  let hoverEnabled = false;

  function processHover() {
    if(hoverEnabled == false) return;

    raycaster.setFromCamera(mousePos, camera);

    const processStickyHit = (newH, oldH, newHHandlerId, oldHHandlerId) => {
      if(newH != null && newH !== oldH ){
        if(oldH != null) {
          HoverHandlers[oldHHandlerId].onHoverOut(oldH);
        }
        
        HoverHandlers[newHHandlerId].onHoverIn(newH);

        lastHoveredStickyItem.item = newH;
        lastHoveredStickyItem.handlerId = newHHandlerId;
      }
    };
  
    const processHit = (newH, oldH, newHHandlerId, oldHHandlerId) => {
      if(newH !== oldH){
        if(oldH != null) {
          console.log("hover Out " + oldH.name);
          HoverHandlers[oldHHandlerId].onHoverOut(oldH);
        }

        if(newH != null){
          HoverHandlers[newHHandlerId].onHoverIn(newH);
        }
        else{
          hideCard();
        }
    }

    lastHoveredItem.item = newH;
    lastHoveredItem.handlerId = newHHandlerId;
    };
    
    let newHoveredItem = { item: null, handlerId: null };
    let hits = raycaster.intersectObjects(sections , false);
    if(hits.length > 0 && hits[0].object)
    {
      newHoveredItem.item = hits[0].object;
      newHoveredItem.handlerId = Layers.sections;
    }
    
    processStickyHit(newHoveredItem.item, lastHoveredStickyItem.item, newHoveredItem.handlerId, lastHoveredStickyItem.handlerId);

    newHoveredItem.item = null;
    newHoveredItem.handlerId = null;

    hits = raycaster.intersectObjects(entries, false);
    if(hits.length > 0 && hits[0].object)
    {
      newHoveredItem.item = hits[0].object;
      newHoveredItem.handlerId = Layers.entries;
    }

    processHit(newHoveredItem.item, lastHoveredItem.item, newHoveredItem.handlerId, lastHoveredItem.handlerId); 
  }

  window.addEventListener('pointermove', (e) => {
  mousePos.x =  (e.clientX / innerWidth) * 2 - 1;
  mousePos.y = -(e.clientY / innerHeight) * 2 + 1;
  hoverEnabled = true;
  });

  function onResize()
  {
    const w = Math.max(1, window.innerWidth);
    const h = Math.max(1, window.innerHeight);

    // camera
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, true); // 'false' = don't change canvas CSS size

    // composer
    composer.setSize(w, h);

    //const wScaled = w * dpr;
    //const hScaled = h * dpr;
    //outlinePass.uniforms.resolution.value.set( Math.floor(wScaled), Math.floor(hScaled) );
    //fxaaPass.material.uniforms['resolution'].value.set(1.0 / (wScaled), 1.0 / (hScaled));
  }

  window.addEventListener('resize', () => {
    onResize();
  });

  renderer.domElement.addEventListener('click', (e) => {
    tryOpenCard();
  });

  onResize();

  // Animation loop
  function animate(){
    const delta = clock.getDelta();
    controls.update();
    processHover();

    composer.render();
    //renderer.render();

    entries.forEach(entry => {
      entry.userData.mixer.update(delta);
    });

    sections.forEach(entry => {
      entry.userData.mixer.update(delta);
    });
  };
})();