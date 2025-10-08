(() => {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || !window.THREE) {
    console.log("No THREE.js!");
    return;
  }

  const cardLayer = document.getElementById('project-card-layer');
  const cards = new Map(
  Array.from(cardLayer.children)              
       .filter(el => el.classList.contains('project-card') && el.id)
       .map(el => [el.id, el])            
  );
  let currentCard = null;

  function showCard(entryId) {
    currentCard = cards.get(entryId);
    if (!currentCard) return;

    currentCard.dataset.open = "true";

    currentCard.hidden = false;
    currentCard.setAttribute('aria-hidden', 'false');
  }

  function hideCard(entryId) {
    const cardToHide = cards.get(entryId);
    if (!cardToHide) return;

    cardToHide.dataset.open = "false";
/*     setTimeout(() => {
      if(cardToHide !== currentCard)
      {
        cardToHide.hidden = true;
        cardToHide.setAttribute('aria-hidden', 'true');
      }
    }, 130);*/
  } 

  function tryOpenCard()
  {
    if(currentCard == null) return;

    const link = currentCard.querySelector('a[href]');
    if (link) {
      //console.log("Card link:", link.href);
      window.open(link.href, '_self');
    }
  }

  const Params =
  {
    bgColor: '#B3AF92',
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

    recordSize: 0.4,
    recordDepth: 0.005,
    recordOffsetY: 0.1,
    recordSensorSizeMultX: 1.2,

    drawerSensorDepth: 0.5,
    drawerSensorSizeMultX: 1.7,
    drawerSensorSizeMultY: 1.2,

    //ambientIntensity: 0.0,
    //sceneTintColorDay: '#B3AF92',
    //sceneTintColorGroundNight: '#000000',
    sceneTintColorDay: '#ada66b',
    sceneTintColorNight: '#101fa3',
    directionalLightIntensity: 1.0,
    fakeEnvironmentIntensityDay: 1.2,
    fakeEnvironmentIntensityNight: 1.2,
    pointLightIntensity: 1.5,
    spotLightIntensity: 0.7,

    toneMappingExposureDay: 1.7,
    toneMappingExposureNight: 1.5,

    windScrollSpeed: 0.7,
    windSampleScale: 5.0,
    plantMaxAngle: 0.001,

    // runtime set
    drawerStartPos: 0, 
  }

  const Interactives =
  {
    lightBulb: 0,
    lampLight: 0,
    sunLight: 0,
    
    lampObject: 0,

    drawer: 0,
    plant: 0,
  }

  const Layers =
  {
    entries: 1,
    sections: 2
  }

  const RuntimeData =
  {
    hoverEnabled: false,
    isDay: true,
    isWindEnabled: true,
    windSampleOffset: 0,
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
  const textureLoader = new THREE.TextureLoader();
  
  const clock = new THREE.Clock();
  let controls;
  if(useControls)
  {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enabled = true;
  }

  camera.position.set(-1, 1.5, 2);
  const axesHelper = new THREE.AxesHelper( 1 );
  //controls.target.set(0, 0.5, 0.5);

  function setAmbient()
  {
    if(RuntimeData.isDay){
      RuntimeData.isWindEnabled = true;
      Interactives.lampLight.intensity = 0.0;
      Interactives.sunLight.intensity = Params.directionalLightIntensity;
      fakeEnvironmentLight.color.set(Params.sceneTintColorDay);      
      fakeEnvironmentLight.groundColor.set(Params.sceneTintColorDay); 
      fakeEnvironmentLight.intensity = Params.fakeEnvironmentIntensityDay;
      renderer.toneMappingExposure = Params.toneMappingExposureDay;      
      console.log(Interactives.plant);       
    }
    else{
      RuntimeData.isWindEnabled = false;
      Interactives.lampLight.intensity = Params.spotLightIntensity;
      Interactives.sunLight.intensity = 0.0;
      fakeEnvironmentLight.color.set(Params.sceneTintColorNight);      
      fakeEnvironmentLight.groundColor.set(Params.sceneTintColorNight);
      fakeEnvironmentLight.intensity = Params.fakeEnvironmentIntensityNight;
      renderer.toneMappingExposure = Params.toneMappingExposureNight;  
    }
  }

  function toggleDayNight()
  {
    RuntimeData.isDay = !RuntimeData.isDay;
    setAmbient();
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
      hideCard(obj.userData.id);
    }  
    },
  [Layers.sections]: {
    onHoverIn:  (obj) => { 
      runSymmetricalAnimation(obj, 1); 

      setTimeout(() => { 
      obj.userData.entrySensors.forEach(sensor => { sensor.scale.y = 1; });
      }, Params.cabinetHoverShiftDuration * 550);
    },
    onHoverOut: (obj) => { 
      runSymmetricalAnimation(obj, -1); 
      obj.userData.entrySensors.forEach(sensor => { sensor.scale.y = 0; }); 
    } 
   },
  };

  const Textures = 
  {
    test: 0,
  } 

  function initializeTexture(tex)
  {
    const data = tex.source?.data || tex.image;
    const w = data?.width, h = data?.height;
    const aspect = (w && h) ? w / h : 1;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.x = 1 / aspect;
    tex.center.x = 0.5;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.magFilter = THREE.NearestFilter;
  }

  const perlin = new Perlin2D(42);
  //Textures.test = createNoiseTexture(perlin, 5.0); //textureLoader.load('./assets/images/cover/battleships.png', (tex) =>{ initializeTexture(tex); });
  //console.log( Textures.test);

  const Materials = {
    default: new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: false, transparent: false }),
    text: new THREE.MeshBasicMaterial({ color: 0x000000 }),
    sensor: new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0 }),
    test: new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: false, transparent: false /* , map: Textures.test  */ }),
  }

  const testGeometry = new THREE.PlaneGeometry( 5, 5 );
  const textQuad = new THREE.Mesh(testGeometry, Materials.test);
  textQuad.position.set(5, 2, 0);
  //scene.add(textQuad);

  fakeEnvironmentLight = new THREE.HemisphereLight(Params.sceneTintColorDay, Params.sceneTintColorDay);
  fakeEnvironmentLight.intensity = Params.fakeEnvironmentIntensityDay;
  scene.add(fakeEnvironmentLight);

  const entryGeometry = new THREE.BoxGeometry( Params.recordSize, Params.recordSize, Params.recordDepth );
  entryGeometry.translate(0, entryGeometry.parameters.height * 0.5, 0);

  const entrySensorGeometry = new THREE.BoxGeometry( Params.recordSize * Params.recordSensorSizeMultX, Params.recordSize + Params.entryHoverShiftDistance, 0.05 );
  entrySensorGeometry.translate(0, entrySensorGeometry.parameters.height * 0.5, 0);

  const cabinetSensorGeometry = new THREE.BoxGeometry( Params.drawerSensorDepth, 
                                                       Params.drawerOuterHeight * Params.drawerSensorSizeMultY, 
                                                       Params.drawerOuterWidth ); 
  cabinetSensorGeometry.translate(Params.drawerOuterDepth + cabinetSensorGeometry.parameters.width * 0.5, cabinetSensorGeometry.parameters.height * 0.5, 0); 

  let entriesCount = 0;
  Params.entriesCount.forEach(count => entriesCount += count);

  let entries = new Array(entriesCount);
  let sections = new Array(Params.sectionsCount);
  
  const { times: entryKfTimes, values: entryKfValues } = getKeyFramesWRate(Params.entryHoverShiftDuration, 120, easeOutCubic, 1.0);
  const entryShiftPos = convertD([Params.entryHoverShiftDistance], entryKfValues);
  const entryShiftUpKF = new THREE.NumberKeyframeTrack(
    ".position[y]",
    entryKfTimes,
    entryShiftPos
  ); 

  //console.log(entryHoverInClip);

  const { times: cabinetKfTimes, values: cabinetKfValues } = getKeyFramesWRate(Params.cabinetHoverShiftDuration, 120, easeOutElastic, 1.0);
  const cabinetShiftPos =  convertD([Params.cabinetHoverShiftDistance], cabinetKfValues);
  const cabinetShiftForwardKF = new THREE.NumberKeyframeTrack(
      ".position[x]",
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
    const sectionContainer = new THREE.Object3D();
    sectionContainer.position.set(Params.drawerStartPos.x, 
                                Params.drawerStartPos.y, 
                                Params.drawerStartPos.z - (sIdx) * Params.drawerSpacing);

    sections[sIdx] = new THREE.Mesh(cabinetSensorGeometry, Materials.sensor);
    sections[sIdx].name = "section" + sIdx;
    sections[sIdx].position.set(0, 0, 0);
    sectionContainer.add(sections[sIdx]);

    const drawerModel = Interactives.drawer.clone(true);
    sectionContainer.add(drawerModel);
    const mixer = new THREE.AnimationMixer(drawerModel);

    sections[sIdx].userData.index = sIdx;
    sections[sIdx].userData.model = drawerModel;
    sections[sIdx].userData.mixer = mixer;
    sections[sIdx].userData.actions = 
    {
      hoverIn: mixer.clipAction(cabinetHoverInClip),
    };
    
    sections[sIdx].userData.actions.hoverIn.loop = THREE.LoopOnce;
    sections[sIdx].userData.actions.hoverIn.clampWhenFinished = true;

    sections[sIdx].userData.entrySensors = new Array(Params.entriesCount[sIdx]);
    scene.add(sectionContainer);
    const entriesSpacing = Params.drawerInnerWidth / Params.entriesCount[sIdx];

    const entriesXOffset = Params.drawerInnerDepth + (Params.drawerOuterDepth - Params.drawerInnerDepth)*0.5 - Params.recordSize*0.5;
    let angleRad = Math.asin((entriesSpacing * 0.5 - Params.recordDepth) / Params.recordSize); 
    
    const entryRotate = convertD([angleRad], entryKfValues, -angleRad);
    const entryRotateKF = new THREE.NumberKeyframeTrack(
      ".rotation[x]",
      entryKfTimes,
      entryRotate
    );
    const entryHoverInClip = new THREE.AnimationClip("entry-hover-in", -1, [
      entryShiftUpKF, entryRotateKF,
    ]);

    for (let eIdx = Params.entriesCount[sIdx]-1; eIdx >=0 ; eIdx--) 
    {
      const entryId = `s${sIdx}e${eIdx}`;
      const etntryContainer = new THREE.Object3D();
      etntryContainer.position.set(entriesXOffset, Params.recordOffsetY, + Params.drawerInnerWidth * 0.5  - entriesSpacing * ( 0.5 + eIdx));

      entries[i] = new THREE.Mesh(entrySensorGeometry, Materials.sensor);
      entries[i].position.set(0, 0, 0);
      entries[i].scale.y = 0; 
      entries[i].name = "sec" + sIdx + "_entry" + eIdx;
      etntryContainer.add(entries[i]);

      const enryCard = cards.get(entryId);
      const entryTex = textureLoader.load(enryCard.dataset.image, (tex) =>{ initializeTexture(tex); });
      const entryMaterial = new THREE.MeshStandardMaterial({ wireframe: false, transparent: false, map: entryTex });
      entryModel = new THREE.Mesh(entryGeometry, entryMaterial);
      entryModel.position.set(0, 0, 0);
      entryModel.rotateX(-angleRad);  
      etntryContainer.add(entryModel);

      //angleRad = angleRad + Math.asin((entriesSpacing * Math.cos(angleRad) - Params.recordDepth) / Params.recordSize);

      const entryMixer = new THREE.AnimationMixer(entryModel);
        
      entries[i].userData.model = entryModel;
      entries[i].userData.index = i;
      entries[i].userData.mixer = entryMixer;
      entries[i].userData.actions = 
      {
        hoverIn: entryMixer.clipAction(entryHoverInClip),
      };

      entries[i].userData.actions.hoverIn.loop = THREE.LoopOnce;
      entries[i].userData.actions.hoverIn.clampWhenFinished = true;
      entries[i].userData.id = entryId;

      sections[sIdx].userData.entrySensors[eIdx] = entries[i];
      sections[sIdx].userData.model.add(etntryContainer);
      
      i += 1;
    }
  }
}

modelLoader.load('./assets/threejs/models/portfolio_room.glb', gltf => { 
  imported = gltf.scene;  

  scene.add(imported);  

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
        
        o.shadow.camera.near = 0.02; 
        o.shadow.camera.far = 15; 
        o.shadow.camera.updateProjectionMatrix();
        o.shadow.normalBias = 0.02;  

        Interactives.sunLight = o;
        }
    if (o.isPointLight) {
      o.intensity = Params.pointLightIntensity;  
      o.castShadow = false;
    }
    if (o.isSpotLight) {
      o.intensity = Params.spotLightIntensity; 
      o.castShadow = true;
      o.receiveShadow = false;
      o.shadow.camera.near = 0.2; 
      o.shadow.camera.far = 4.0; 
      o.shadow.camera.updateProjectionMatrix();
      o.shadow.normalBias = -0.31;
      Interactives.lampLight = o;
    }
  } 
  else if (o.isMesh) {
    o.receiveShadow = true;
    o.castShadow = true;
  }
  });
  
  Interactives.lightBulb = imported.getObjectByName("LightBulb");
  Interactives.lightBulb.receiveShadow  = false;
  Interactives.lightBulb.castShadow  = false;

  Interactives.lampObject = imported.getObjectByName("LampShell");
  Interactives.lampObject.receiveShadow  = false;
  Interactives.lampObject.castShadow  = false;
  
  //TODO: redo by instancing at hooks 
  Interactives.drawer = imported.getObjectByName("Drawer");
  Params.drawerStartPos = new THREE.Vector3(Interactives.drawer.position.x, Interactives.drawer.position.y, Interactives.drawer.position.z);
  Interactives.drawer.position.set(0, 0, 0);
  Interactives.drawer.parent.remove(Interactives.drawer);

  Interactives.plant = imported.getObjectByName("Plant");

  initializeCabinet();

  setAmbient();

	renderer.setAnimationLoop( animate );
});

  scene.background  = new THREE.Color(Params.bgColor);

  renderer.setClearColor(Params.bgColor);  

  let lastHoveredItem = { item: null, handlerId: null};
  let lastHoveredStickyItem = { item: null, handlerId: null};

  function processHover() {
    if(RuntimeData.hoverEnabled == false) return;

    raycaster.setFromCamera(mousePos, camera);

    const processStickyHit = (newH, oldH, newHHandlerId, oldHHandlerId) => {
      if(newH != null  && newH !== oldH  ){
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
          //console.log("hover Out " + oldH.name);
          HoverHandlers[oldHHandlerId].onHoverOut(oldH);
        }

        if(newH != null){
          //console.log("hover In " + newH.name);
          HoverHandlers[newHHandlerId].onHoverIn(newH);
        }
        else{
          currentCard = null;
        }
    }

    lastHoveredItem.item = newH;
    lastHoveredItem.handlerId = newHHandlerId;
    };
    
    let newHoveredItem = { item: null, handlerId: null };
    let hits = raycaster.intersectObjects(sections , false);
    
    const hitsPrevious = lastHoveredStickyItem.item != null && hits.some(h => h?.object === lastHoveredStickyItem.item);
    if(!hitsPrevious && hits.length > 0 && hits[0].object)
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
  RuntimeData.hoverEnabled = true;
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

  const GuiData = {
    ToggleDayNight: toggleDayNight,
  }

  const gui = new lil.GUI();
  gui.add(GuiData, 'ToggleDayNight');
  gui.add(Params, 'windScrollSpeed');
  gui.add(Params, 'windSampleScale');
  gui.add(Params, 'plantMaxAngle');

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

    if (RuntimeData.isWindEnabled)
    {
      RuntimeData.windSampleOffset += delta * Params.windScrollSpeed;
      const offset = perlin.noise(Params.windSampleScale, RuntimeData.windSampleOffset);
      Interactives.plant.rotateZ(offset * Params.plantMaxAngle);
    }
  };
})();