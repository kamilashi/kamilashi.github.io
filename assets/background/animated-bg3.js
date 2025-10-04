(() => {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || !window.THREE) {
    console.log("No THREE.js!");
    return;
  }

  const cardEl = document.getElementById('project-card');

  function showCard(entryId) {
    return;
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
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping =  THREE.ReinhardToneMapping;   
  renderer.toneMappingExposure = 1.7;             
  renderer.physicallyCorrectLights = true;
  //renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
  renderer.shadowMap.enabled = true;

  let useControls = true;

  const raycaster = new THREE.Raycaster();
  const mousePos = new THREE.Vector2();

  const scene = new THREE.Scene();
  let camera = new THREE.PerspectiveCamera(
    50, 
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

  const modelLoader = new THREE.GLTFLoader();
  
  const clock = new THREE.Clock();
  let controls;
  if(useControls)
  {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enabled = true;
  }
  //
  //

  camera.position.set(-1, 1.5, 2);
  const axesHelper = new THREE.AxesHelper( 1 );
  //controls.target.set(0, 0.5, 0.5);

  const Params =
  {
    bgColor: '#B3AF92',
    cabinetSize: 0.5,
    //cabinetDepthMultiplier: 1.4,
    //cabinetsSpacing: 0.01,
    cabinetShellScaleMultiplier: 1.1,
    entriesCount: [4, 8], // sync with the site data!
    sectionsCount: 2, // sync with the site data!
    titleTopMargin: 0.1,
    titleXOffsetStep: 0.17,

    entryHoverShiftDistance: 0.5,
    entryHoverShiftDuration: 0.2,
    cabinetHoverShiftDistance: 0.5,
    cabinetHoverShiftDuration: 1.0,

    drawerSpacing: 0.65625, // from the blender file. TODO: replace with some named hooks
    drawerOuterWidth: 0.628,
    drawerOuterDepth: 0.703,
    drawerOuterHeight: 0.484,

    drawerInnerWidth: 0.607,
    drawerInnerDepth: 0.678,

    recordSize: 0.8,

    sensorBoundingVolMult: 1.1,

    //sceneTintColor: '#B3AF92',
    sceneTintColor: '#ada66b',
    directionalLightIntensity: 1.0,
    ambientIntensity: 0.0,
    fakeEnvironmentIntensity: 1.2,
    pointLightIntensity: 1.5,
    spotLightIntensity: 0.0,

    // runtime set:
    drawerStartPos: 0, 
  }

  let Interactives =
  {
    lampLight: 0,
    lampObject: 0,

    drawer: 0,
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
      //runSymmetricalAnimation(obj, 1);
      showCard(obj.userData.id);
     },
    onHoverOut: (obj) => { 
      //runSymmetricalAnimation(obj, -1); 
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
    sensor: new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: true, transparent: false, opacity: 0 }),
  }

  const entryGeometry = new THREE.PlaneGeometry( Params.recordSize, Params.recordSize );
  entryGeometry.translate(0, entryGeometry.parameters.height * 0.5, 0);

  const entrySensorGeometry = new THREE.PlaneGeometry( Params.recordSize, Params.recordSize + Params.entryHoverShiftDistance );
  entrySensorGeometry.translate(0, entrySensorGeometry.parameters.height * 0.5, 0);

  const cabinetSensorGeometry = new THREE.BoxGeometry( Params.drawerOuterDepth * Params.sensorBoundingVolMult, 
                                                       Params.drawerOuterHeight , 
                                                       Params.drawerOuterWidth ); 
  cabinetSensorGeometry.translate(cabinetSensorGeometry.parameters.width * 0.5, cabinetSensorGeometry.parameters.height * 0.5, 0); 

  let entriesCount = 0;
  Params.entriesCount.forEach(count => entriesCount += count);

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
const cabinetShiftPos =  convertD([Params.cabinetHoverShiftDistance, 0.0, 0.0], cabinetKfValues);
const cabinetShiftForwardKF = new THREE.VectorKeyframeTrack(
    ".position",
    cabinetKfTimes,
    cabinetShiftPos
  );
const cabinetHoverInClip = new THREE.AnimationClip("section-hover-in", -1, [
    cabinetShiftForwardKF 
  ]);

  let i = 0;
  let imported;

  function initializeCabinet(){
  for(let sIdx = 0; sIdx < Params.sectionsCount; sIdx++)
  {
    const maxIndex =  Params.sectionsCount - 1;
    sections[sIdx] = new THREE.Mesh(cabinetSensorGeometry, Materials.sensor);
    sections[sIdx].name = "section" + sIdx;
    sections[sIdx].position.set(Params.drawerStartPos.x, 
                                Params.drawerStartPos.y, 
                                Params.drawerStartPos.z - (maxIndex - sIdx) * Params.drawerSpacing);

    const drawerModel = Interactives.drawer.clone(true);
    const mixer = new THREE.AnimationMixer(drawerModel);

    sections[sIdx].add(drawerModel);
    sections[sIdx].userData.model = drawerModel;
    sections[sIdx].userData.mixer = mixer;
    sections[sIdx].userData.actions = 
    {
      hoverIn: mixer.clipAction(cabinetHoverInClip),
    };
    
    sections[sIdx].userData.actions.hoverIn.loop = THREE.LoopOnce;
    sections[sIdx].userData.actions.hoverIn.clampWhenFinished = true;
    //sections[sIdx].add(axesHelper);

    // something fishy is going on, check the keyframes!
    sections[sIdx].userData.entrySensors = new Array(Params.entriesCount[sIdx]);
    scene.add(sections[sIdx]);
    const entriesSpacing = Params.drawerInnerWidth / Params.entriesCount[sIdx];
    const entriesXOffset = Params.drawerInnerDepth - Params.recordSize * 0.5;

    for (let eIdx = 0; eIdx < Params.entriesCount[sIdx]; eIdx++) {

      entries[i] = new THREE.Mesh(entrySensorGeometry, Materials.sensor);
      entries[i].scale.y = 0; 
      entries[i].name = "sec" + sIdx + "_entry"+eIdx;
      entries[i].position.set(entriesXOffset, 0.0, - Params.drawerInnerWidth * 0.5  + entriesSpacing * ( 1 + eIdx));

      entryModel = new THREE.Mesh(entryGeometry, Materials.default);
      
      entryModel.position.set(0, 0, 0);
      const entryMixer = new THREE.AnimationMixer(entryModel);
        
      entries[i].userData.model = entryModel;
      entries[i].userData.mixer = entryMixer;
      entries[i].userData.actions = 
      {
        hoverIn: entryMixer.clipAction(entryHoverInClip),
      };

      entries[i].userData.actions.hoverIn.loop = THREE.LoopOnce;
      entries[i].userData.actions.hoverIn.clampWhenFinished = true;
      entries[i].userData.id = `s${sIdx}e${eIdx}`
      entries[i].add(entryModel);

      sections[sIdx].userData.entrySensors[eIdx] = entries[i];
      sections[sIdx].userData.model.add(entries[i]);
      sections[sIdx].userData.model.add(axesHelper);
      
      i += 1;
    }
  }
}

modelLoader.load('./assets/threejs/models/portfolio_room.glb', gltf => { 
  imported = gltf.scene;  

  scene.add(imported);  

  // If you want to use the imported camera:
  const camNode = gltf.cameras?.[0] || imported.getObjectByProperty('type', 'PerspectiveCamera');
  if (camNode) {
  camera = camNode;                         
  camera.aspect = renderer.domElement.clientWidth / renderer.domElement.clientHeight;
  camera.updateProjectionMatrix();

  if(useControls){
      controls.object = camera;
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      controls.target.copy(camera.position).addScaledVector(dir, 5); 
      controls.update();
    }
  }

  //console.log(imported);

  imported.traverse((o) => {
  if (o.isLight) {
    // todo: lookup by name
    if (o.isDirectionalLight) { 
        o.intensity = Params.directionalLightIntensity; 
        o.castShadow = true;

        o.shadow.mapSize.width = 4096; 
        o.shadow.mapSize.height = 4096; 
        
        o.shadow.camera.near = 0.01; 
        o.shadow.camera.far = 20; 
        o.shadow.normalBias = 0.02;
        }
    if (o.isPointLight) {
      o.intensity = Params.pointLightIntensity;  
    }
    if (o.isSpotLight) {
      Interactives.lampLight = o;
      o.intensity = Params.spotLightIntensity; 
    }
  } 

  if (o.isMesh) {
    o.receiveShadow = true;
    o.castShadow = true;

    // todo: lookup by name
    if(o.name == "LightBulb")
    {
      Interactives.lampObject = o;
      o.castShadow = false;
      o.receiveShadow = false;
    }
  }
  });
  
  //TODO: redo by instancing at hooks 
  Interactives.drawer = imported.getObjectByName("Drawer");
  Params.drawerStartPos = new THREE.Vector3(Interactives.drawer.position.x, Interactives.drawer.position.y, Interactives.drawer.position.z);
  Interactives.drawer.position.set(0, 0, 0);
  Interactives.drawer.parent.remove(Interactives.drawer);

  initializeCabinet();
});

	renderer.setAnimationLoop( animate );
  
  ambientLight = new THREE.AmbientLight(Params.sceneTintColor);
  ambientLight.intensity = Params.ambientIntensity;
  scene.add(ambientLight);

  fakeEnvironmentLight = new THREE.HemisphereLight(Params.sceneTintColor, Params.sceneTintColor);
  fakeEnvironmentLight.intensity = Params.fakeEnvironmentIntensity;
  scene.add(fakeEnvironmentLight);

  scene.background  = new THREE.Color(Params.bgColor);

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

    if(useControls)
    {
      controls.update();
    }
    
    processHover();

    //composer.render();
    renderer.render(scene, camera);

    entries.forEach(entry => {
      entry.userData.mixer.update(delta);
    });

    sections.forEach(entry => {
      entry.userData.mixer.update(delta);
    });
  };
})();