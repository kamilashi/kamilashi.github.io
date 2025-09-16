(() => {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || !window.THREE) {
    console.log("No THREE.js!");
    return;
  }

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true 
  });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const raycaster = new THREE.Raycaster();
  const mousePos = new THREE.Vector2();
  let lastHoveredObject = null;

  window.addEventListener('pointermove', (e) => {
  mousePos.x =  (e.clientX / innerWidth) * 2 - 1;
  mousePos.y = -(e.clientY / innerHeight) * 2 + 1;
});

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    100
  );
camera.position.set(-1, 1, 1);
camera.lookAt(0, 0, 0);

  const Params =
  {
    bgColor: 0x000000,
    cabinetSize: 0.5,
    entriesCount: 1,
    sectionsCount: 2,
    titleTopMargin: 0.1,
    titleXOffsetStep: 0.17,
    entryHoverShiftDistance: 0.5
  }

  let Vars =
  {
    entryShiftStart: 0
  }

  const Layers =
  {
    entries: 1,
    sections: 2
  }

    const kfTimes = [0, 0.5, 1];
    let entryShiftPos = new Float32Array(3 * kfTimes.length);
    const entryShiftUpKF = new THREE.VectorKeyframeTrack(
      ".position",
      kfTimes,
      entryShiftPos
    );

    const entryShiftDowntKF = new THREE.VectorKeyframeTrack(
      ".position",
      kfTimes,
      entryShiftPos
    );

    const entryHoverInClip = new THREE.AnimationClip("entry-hover-in", -1, [
      entryShiftUpKF,
    ]);

    const entryHoverOutClip = new THREE.AnimationClip("entry-hover-out", -1, [
      entryShiftDowntKF,
    ]);

  const HoverHandlers = {
  [Layers.entries]: {
    onHoverIn:  (obj) => { 
      const entryShiftStart = obj.userData.model.position.y;
      entryShiftPos.set([0, [entryShiftStart], 0, 
                       0, [entryShiftStart] + 0.2 * Params.entryHoverShiftDistance, 0,
                       0, 1 * Params.entryHoverShiftDistance, 0]);
      console.log("Hover entered object", obj.userData.model.position.y); 
      obj.userData.actions.hoverOut.stop();
      obj.userData.actions.hoverIn.reset().play(); },
    onHoverOut: (obj) => { 
      const entryShiftStart = obj.userData.model.position.y;
      entryShiftPos.set([0, 1 * [entryShiftStart], 0,
                       0, 0.2 * [entryShiftStart], 0,
                       0, 0, 0]);
      console.log("Hover left object", obj.userData.model.position.y); 
      obj.userData.actions.hoverIn.stop();
      obj.userData.actions.hoverOut.reset().play();  }
  },
  [Layers.sections]: {
    onHoverIn:  (obj) => { obj.userData.actions.hoverIn.reset().play(); console.log("Hovered section object", obj); },
    onHoverOut: (obj) => { obj.userData.actions.hoverOut.reset().play(); console.log("Left section object", obj); }
  }
  };

  const Materials = {
    default: new THREE.MeshStandardMaterial({ color: 0x6699ff, wireframe: false, transparent: false }),
    text: new THREE.MeshBasicMaterial({ color: 0x000000 }),
    sensor: new THREE.MeshStandardMaterial({ color: 0x6699ff, wireframe: true, transparent: true }),
  }

  const entryGeometry = new THREE.PlaneGeometry( Params.cabinetSize, Params.cabinetSize );
  const entrySensorGeometry = new THREE.PlaneGeometry( Params.cabinetSize, Params.cabinetSize + Params.entryHoverShiftDistance );

  //let entries = new Array(Params.entriesCount);
  let spacing = Params.cabinetSize / Params.entriesCount;
  let cabinetPosition = new THREE.Vector3(0, 0, 0);
  const cabinetHalfSize = Params.cabinetSize * 0.5;

  let entries = new Array(Params.entriesCount);
  let sencitons = new Array(Params.entriesCount);

  for (let i = 0; i < Params.entriesCount; i++) {
      entries[i] = new THREE.Mesh(entrySensorGeometry, Materials.sensor);
      entries[i].position.set(0, 0, Params.cabinetSize - spacing * (1 + i));
      entries[i].position.add(cabinetPosition);

      entryModel = new THREE.Mesh(entryGeometry, Materials.default);
      entryModel.position.set(0, 0, entries[i].position.z);
      //entryModel.position.sub(new THREE.Vector3(0, cabinetHalfSize, 0));
      mixer = new THREE.AnimationMixer(entryModel);
      
      entries[i].userData.model = entryModel;
      entries[i].userData.mixer = mixer;
      entries[i].userData.actions = 
      {
        hoverIn: mixer.clipAction(entryHoverInClip),
        hoverOut: mixer.clipAction(entryHoverOutClip)
      };

      entries[i].userData.actions.hoverIn.loop = THREE.LoopOnce;
      entries[i].userData.actions.hoverIn.clampWhenFinished = true;

      entries[i].userData.actions.hoverOut.loop = THREE.LoopOnce;
      entries[i].userData.actions.hoverOut.clampWhenFinished = true;

      entries[i].add(entryModel);

      scene.add(entries[i]);
  }

  scene.add(new THREE.AmbientLight('#606060'));
  const light = new THREE.PointLight();
  light.position.set(0, 1, 1);
  scene.add(light);

  const loader = new THREE.FontLoader();

  loader.load( 'https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_regular.typeface.json', function ( font ) {

	for (let i = 0; i < Params.entriesCount; i++) {
      const textGeometry = new THREE.TextGeometry('Title', {
        font: font,                  
        size: 0.04,
        height: 0,
        curveSegments: 12,
        bevelEnabled: false
      });

      const textMesh = new THREE.Mesh(textGeometry, Materials.text);
      textMesh.position.set(-cabinetHalfSize + i * Params.titleXOffsetStep, cabinetHalfSize - Params.titleTopMargin, 0.01); // slight z-offset to avoid z-fighting
      entries[i].userData.model.add(textMesh);
      
			renderer.setAnimationLoop( animate );
   }
  });

  renderer.setClearColor(Params.bgColor);  
  const clock = new THREE.Clock();
  const controls = new THREE.OrbitControls(camera, renderer.domElement);

  // Resize handling
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });

  let lastHoveredItem = { item: null, handlerId: null,  };

  function processHover() {
  raycaster.setFromCamera(mousePos, camera);
  
  const processHit = (newH, oldH, newHHandlerId, oldHHandlerId) => {
    if(newH !== oldH)
  {
    if(oldH != null)
    {
      HoverHandlers[oldHHandlerId].onHoverOut(oldH);
    }

    if(newH != null)
    {
      HoverHandlers[newHHandlerId].onHoverIn(newH);
    }
  }

  lastHoveredItem.item = newH;
  lastHoveredItem.handlerId = newHHandlerId;
  };

  
  let newHoveredItem = { item: null, handlerId: null };
  let hits = raycaster.intersectObjects(entries, false);
  if(hits.length > 0 && hits[0].object)
  {
    newHoveredItem.item = hits[0].object;
    newHoveredItem.handlerId = Layers.entries;
  }
/*   else{
      hits = raycaster.intersectObjects(sencitons, false);
    if(hits.length > 0 && hits[0].object)
    {
      newHoveredItem.item = hits[0].object;
      newHoveredItem.item = Layers.sencitons;
    }
  } */

  processHit(newHoveredItem.item, lastHoveredItem.item, newHoveredItem.handlerId, lastHoveredItem.handlerId);
}

  // Animation loop
  function animate(){
    const delta = clock.getDelta();
    controls.update();
    processHover();
    renderer.render(scene, camera);

    entries.forEach(entry => {
      entry.userData.mixer.update(delta);
    });
  };
})();