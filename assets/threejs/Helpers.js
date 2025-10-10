import * as THREE from 'three';

export function syncDecay(input, amplitudeCoef, decayRate, period, phaseCoef)
{
    const freq = (2.0 * Math.PI) / period;
    const sync = Math.pow(2.0, -1.0 * decayRate * input) 
               * Math.cos(freq * input + phaseCoef) 
               * amplitudeCoef;

    return sync;
}

export function linearRampInOut(input) {
    return 1.0 - 2.0 * Math.abs(input - 0.5);
}

export function easeOutCubic(input) {
    return 1 - Math.pow(1 - input, 3);
}

export function easeOutElastic(input) {
    const c4 = (2.0 * Math.PI) / 3.0;

    if (input === 0.0) return 0.0;
    if (input === 1.0) return 1.0;

    return Math.pow(2.0, -10.0 * input) * 
           Math.sin((input * 10.0 - 0.75) * c4) + 1.0;
}

export function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
}

export function clamp01(number) {
  return clamp(number, 0.0, 1.0);
}

export function getKeyFrames(duration, sampleCount, sampledFunction, scale = 1)
{
    const sampleStep = duration / sampleCount;

    let times = new Array(sampleCount)
    let values = new Array(sampleCount)

    for (let i = 0; i < sampleCount-1; i++)
    {
        const sampledTime = i * sampleStep;
        const progress = clamp01(sampledTime / duration);
        
        times[i] = sampledTime;
        values[i] = sampledFunction(progress) * scale;
    }

    times[sampleCount-1] = duration;
    values[sampleCount-1] = sampledFunction(1.0) * scale;

    return {times, values}
}

export function getKeyFramesWRate(duration, sampleRate, sampledFunction, scale = 1)
{
    const sampleCount = Math.floor(duration * sampleRate);
    
    return getKeyFrames(duration, sampleCount, sampledFunction, scale);
}

export function convertD(dimensionVector, values, addValue = 0)
{
    const width = dimensionVector.length;
    const output = new Float32Array(values.length * width);
    for(let i = 0; i < values.length; i++)
    {
        for(let j = 0; j < width; j++)
        {
            output[i*width + j] = values[i] * dimensionVector[j] + addValue;
        }
    }
    return output;
}

export function convertDD(dimensionVector, values, addValue)
{
    const width = dimensionVector.length;
    const output = new Float32Array(values.length * width);
    for(let i = 0; i < values.length; i++)
    {
        for(let j = 0; j < width; j++)
        {
            output[i*width + j] = values[i] * dimensionVector[j] + addValue[j];
        }
    }
    return output;
}

export function getReversed3DArray(array3D){
    const reversed = structuredClone(array3D);
    let stopIdx = array3D.length / 3;
    stopIdx = array3D.length - Math.floor(stopIdx / 2) * 3;

    for(let i = array3D.length-1; i > stopIdx; i-=3)
    {
        reversed[array3D.length - i - 1] =  array3D[i-2];
        reversed[i-2] = array3D[array3D.length - i - 1];

        reversed[array3D.length - i] =  array3D[i-1];
        reversed[i-1] = array3D[array3D.length - i];

        reversed[array3D.length - i + 1] =  array3D[i];
        reversed[i] = array3D[array3D.length - i + 1];
    }

    return reversed;
}

export function createNoiseTexture(perlin, scale)
{
    const textureSideSize = 128;
    const textureWidth = textureSideSize;
    const textureHeight = textureSideSize;

    const textureSize = textureWidth * textureHeight;
    const colorTextureData = new Uint8Array(4 * textureSize);

    //const perlin = new Perlin2D(42);
    const channelCount = 4;

    for (let i = 0; i < textureSize; i++) {

		const vi = Math.floor(i / textureHeight) //y
		const ui = i % textureHeight //x
	
		const texcoord = new THREE.Vector2(0, 0);
		texcoord.x = ui / textureWidth
		texcoord.y = vi / textureHeight
	
		const stride = i * channelCount;

        const noise = perlin.octaveNoise01(texcoord.x * scale, texcoord.y * scale); // perlin.noise01(texcoord.x * scale, texcoord.y * scale);
		const value = noise * 255;
	
		colorTextureData[stride] = value; //r
		colorTextureData[stride + 1] = value; //g
		colorTextureData[stride + 2] = value; //b
		colorTextureData[stride + 3] = 255;
	}

    // used the buffer to create a DataTexture
    const colorTexture = new THREE.DataTexture(colorTextureData, textureWidth, textureHeight);
    colorTexture.needsUpdate = true;
    return colorTexture;
}

export function bakeLocalScale(mesh, { cloneGeometry = true } = {}) {
  if (!mesh?.isMesh || !mesh.geometry) return;

  if (cloneGeometry) mesh.geometry = mesh.geometry.clone();

  mesh.updateMatrix(); 

  const _p = new THREE.Vector3();
  const _q = new THREE.Quaternion();
  const _s = new THREE.Vector3();
  mesh.matrix.decompose(_p, _q, _s);

  const scaleMat = new THREE.Matrix4().makeScale(_s.x, _s.y, _s.z);
  mesh.geometry.applyMatrix4(scaleMat);

  mesh.scale.set(1, 1, 1);
  mesh.updateMatrix();

  if (mesh.geometry.attributes.normal) {
    mesh.geometry.normalizeNormals?.();
  }
  mesh.geometry.computeBoundingBox();
  mesh.geometry.computeBoundingSphere();
}