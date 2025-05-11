---
layout: post
---

<div style="height: 50px;"></div>

During my part-time employment at Kaiko I created 3 particle effects, designing and implementing their behavior (C++, engine side) and visuals (HLSL, graphics side). The early iteration of the particle engine itself was provided by [Jan Enders](https://aldurethar.github.io/kkp5-particles).

Each particle effect consists of an arbitrary number of layers, each layer can be thought of as a collection of particles grouped by their shared material, shader and movement behavior. All particles have the *same* set of properties, mostly defined per layer, simetimes per particle (like those that require randomization), sometimes globally for the entire effect (like wind direction, scale, root position and so on).

## Fire Effect

<video width="720px" autoplay muted loop >
    <source src="/assets/videos/firefx_f.mp4" type="video/mp4">
</video >

<!-- <div class="video-row vid-2" >
	<video autoplay muted loop controls >
	  <source src="/assets/videos/firefx_f.mp4" type="video/mp4">
	</video >
	<video autoplay muted loop controls >
	  <source src="/assets/videos/embers_f.mp4" type="video/mp4">
	</video >
</div > -->

The fire effect consists of the following layers:
 
 - Base
 - Glow
 - Flames
 - Embers
 - Sparks

<div class="video-row vid-3" >
	<video autoplay muted loop >
	  <source src="/assets/videos/base_f.mp4" type="video/mp4">
	</video >
	<video autoplay muted loop >
	  <source src="/assets/videos/glow_f.mp4" type="video/mp4">
	</video >
	<video autoplay muted loop >
	  <source src="/assets/videos/flames_f.mp4" type="video/mp4">
	</video >
</div >

*Base, glow and flames layers.*


<div class="video-row vid-2" >
	<video autoplay muted loop  >
	  <source src="/assets/videos/sparks_f.mp4" type="video/mp4">
	</video >
	<video autoplay muted loop >
	  <source src="/assets/videos/embers_f.mp4" type="video/mp4">
	</video >
</div >

*Sparks and embers.*

### Sparks movement: 

<span style="color: red; font-weight: bold;">Replace with uptodate code</span>

```
float3 getSparksPath(float3 inPos, float3 dir, float deltaTime, float time, float seedPerParticle) 
{
	float maxFreq = 23.0f;
	float frequency = (seedPerParticle * 0.01f) * maxFreq; //will give percentage of maxFreq
	float amplitude = 1.0f;

	float orbitFreq = (seedPerParticle - 50.0f) * 100.0f; //remap range from -100 to 100

	float randomOffset = (seedPerParticle * 0.003f) + exp(-3.1f * time)*0.1f;
	float sign = getRandomSign(amplitude);
	float randomPhaseOffset = ( -0.3f) * (float)PI;
	float mainPath = (randomOffset + amplitude * sin(time * frequency + randomPhaseOffset) * exp(-0.20f * time * frequency));

	float3 outPos = {(amplitude * sin(orbitFreq * 0.01f) * mainPath * dir.x),
					 inPos.y + deltaTime * dir.y ,
					(sign * amplitude* cos(orbitFreq * 0.01f) * mainPath* dir.z)};

	return outPos;
}

```

### Embers movement: 

<span style="color: red; font-weight: bold;">Replace with uptodate code</span>

```
float3 getEmbersPath(float3 inPos, float3 dir , float deltaTime, float time, float seedPerParticle) 
{
	float maxFreq = 1.0f; 
	float maxAmp = 0.2f; 
	float frequency = (seedPerParticle) * 0.01f * maxFreq; //will give percentage of maxFreq
	float amplitude = maxAmp /(frequency + 0.1f); // reverse proportion

	float sign = getRandomSign(seedPerParticle);
	float randomPhaseOffset = (seedPerParticle * 0.01f) * (float)PI;

	float3 outPos = { sign * amplitude * sin(time * frequency + randomPhaseOffset) * dir.x,
							   inPos.y + deltaTime * dir.y,
							   inPos.z + deltaTime * 0 };
	return outPos;
}
```


## Leaves and Dust Effect

 - SandClouds
 - SingleFlakes
 - FlakeThreads (Trails)

 <div class="video-row vid-2" >
	<video autoplay muted loop>
	  <source src="/assets/videos/dustfx_cr_f.mp4" type="video/mp4">
	</video >
	<video autoplay muted loop>
	  <source src="/assets/videos/dust_cr_f.mp4" type="video/mp4">
	</video >
</div >

## Fog Effect

- Base

 <div class="video-row vid-2" >
	<video autoplay muted loop>
	  <source src="/assets/videos/fogfx_f.mp4" type="video/mp4">
	</video >
	<video autoplay muted loop>
	  <source src="/assets/videos/fog_f.mp4" type="video/mp4">
	</video >
</div >