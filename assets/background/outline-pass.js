const OutlinePass = new THREE.ShaderPass({
  uniforms: {
    tDiffuse:   { value: null },
    resolution: { value: new THREE.Vector2() }, // px
    threshold:  { value: 0.005 },                // edge sensitivity
    edgeColor:  { value: new THREE.Color(0x000000) },
    bgColor:    { value: new THREE.Color(0xffffff) },
    edgeOnly:   { value: 1 },                   // 1 = just edges
    strength:   { value: 1.0 },                 // mix strength of outlines over scene
    thickness:  { value: 0.1 },                 // px
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main(){
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,
  fragmentShader: /* glsl */`
    precision highp float;
    varying vec2 vUv;

    uniform sampler2D tDiffuse;
    uniform vec2  resolution; // in pixels
    uniform float threshold;
    uniform vec3  edgeColor;
    uniform vec3  bgColor;
    uniform float edgeOnly;
    uniform float strength;
    uniform float thickness;

    float luma(vec3 c){
      return dot(c, vec3(0.2126, 0.7152, 0.0722));
    }

    void main(){
        vec2 texel = (thickness / resolution);

        // 3x3 Sobel on luma
        vec3 c00 = texture2D(tDiffuse, vUv + texel * vec2(-1.0, -1.0)).rgb;
        vec3 c10 = texture2D(tDiffuse, vUv + texel * vec2( 0.0, -1.0)).rgb;
        vec3 c20 = texture2D(tDiffuse, vUv + texel * vec2( 1.0, -1.0)).rgb;

        vec3 c01 = texture2D(tDiffuse, vUv + texel * vec2(-1.0,  0.0)).rgb;
        vec3 c11 = texture2D(tDiffuse, vUv).rgb;
        vec3 c21 = texture2D(tDiffuse, vUv + texel * vec2( 1.0,  0.0)).rgb;

        vec3 c02 = texture2D(tDiffuse, vUv + texel * vec2(-1.0,  1.0)).rgb;
        vec3 c12 = texture2D(tDiffuse, vUv + texel * vec2( 0.0,  1.0)).rgb;
        vec3 c22 = texture2D(tDiffuse, vUv + texel * vec2( 1.0,  1.0)).rgb;

        float tl=luma(c00),  t=luma(c10),  tr=luma(c20);
        float l =luma(c01),  m=luma(c11),  r =luma(c21);
        float bl=luma(c02),  b=luma(c12),  br=luma(c22);

        float gx = -tl - 2.0*l - bl + tr + 2.0*r + br;
        float gy = -tl - 2.0*t - tr + bl + 2.0*b + br;
        float g  = sqrt(gx*gx + gy*gy);

        float localScale = max(0.0001, m);
        float edge = smoothstep(threshold, threshold * 2.0, g / localScale);

        // Composite
        vec3 base = c11;                           
        vec3 outlined = mix(base, edgeColor, edge * strength);

        // Edge only:
        vec3 edgeOnlyView = mix(bgColor, edgeColor, edge * strength);

        vec3 finalCol = mix(outlined, edgeOnlyView, edgeOnly);

        gl_FragColor = vec4(finalCol, 1.0);
    }
  `
});