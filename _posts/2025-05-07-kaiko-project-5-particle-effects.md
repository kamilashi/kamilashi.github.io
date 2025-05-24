---
layout: post
---

<div style="height: 50px;"></div>

During my part-time employment at Kaiko, I created three particle effects - designing and implementing both their behavior (C++, engine-side) and visuals (HLSL, graphics-side). The early prototype of the particle runtime was provided by [Jan Enders](https://aldurethar.github.io/).

Each particle effect is organized into layers, where each layer represents a group of particles sharing the same material, shader, and movement behavior. All particles use the same set of properties, which are primarily defined at the layer level. Some parameters are set per particle - for example, properties requiring randomization - while others are defined globally for the entire effect, such as wind direction, scale, and root position.

## Fire Effect

<video width="720px" autoplay muted loop >
    <source src="/assets/videos/firefx_f.mp4?v=1" type="video/mp4">
</video >

The fire effect consists of the following layers:
 
 - Base
 - Glow
 - Flames
 - Sparks
 - Embers

<div class="video-row vid-3" >
	<video autoplay muted loop >
	  <source src="/assets/videos/base_f.mp4?v=1" type="video/mp4">
	  Could not load the video
	</video >
	<video autoplay muted loop >
	  <source src="/assets/videos/glow_f.mp4?v=1" type="video/mp4">
	  Could not load the video
	</video >
	<video autoplay muted loop >
	  <source src="/assets/videos/flames_f.mp4?v=1" type="video/mp4">
	  Could not load the video
	</video >
</div >

*Base, glow and flames layers.*


<div class="video-row vid-2" >
	<video autoplay muted loop  >
	  <source src="/assets/videos/sparks_f.mp4?v=1" type="video/mp4">
	  Could not load the video
	</video >
	<video autoplay muted loop >
	  <source src="/assets/videos/embers_f.mp4?v=1" type="video/mp4">
	  Could not load the video
	</video >
</div >

*Sparks and embers.*

<!-- ### Sparks: 

Below is a code snippet that produces the hourglass-shaped trajectory for the sparks. 

``` cpp
float3 getSparksPath(const ParticleParameters& particle, float deltaTime, float time, float maxFreq /* = 23.0f*/, float maxAmp /* = 1.3f*/) 
{
	float3 inPos = particle.pos;
	float3 dir = particle.dir;
	float seedPerParticle = (float) particle.randomInt;
	float frequency = (seedPerParticle * 0.01f) * maxFreq; //will give percentage of maxFreq
	float amplitude = maxAmp;
	float orbitFreq = (seedPerParticle - 50.0f) * 100.0f; //remap range from -100 to 100
	float randomOffset = (seedPerParticle * 0.001f) + exp(-5.1f * time) * 0.1f;
	float sign = getRandomSign(amplitude);
	float randomPhaseOffset = (-0.3f) * (float)PI;
	float mainPath = (randomOffset + amplitude * sin(time * frequency + randomPhaseOffset) * exp(-0.40f * time * frequency));

	float3 outPos = {(amplitude * sin(orbitFreq * 0.01f) * mainPath * dir.x) ,
			inPos.y + deltaTime * dir.y,
			(sign * amplitude * cos(orbitFreq * 0.01f) * mainPath * dir.z)
	};
	outPos = addFloat3(outPos, particle.spawnPos);
	return outPos;
}

``` -->

### Embers: 

The most detailed of the five layers, the embers follow a path with increasing jitter toward the end of their lifecycle and feature a shader that simulates the "burning" of the embers.

<details>
<summary>C++ code snippet that produces the movement path for the embers</summary>
{% highlight cpp %}
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
{% endhighlight %}
</details>

<div style="height: 20px;"></div>

<details>
<summary>Shader code snippet that produces the start glow, the outer rim and the fade to black effects on the embers.</summary>
{% highlight hlsl %}
GpuFireParticle particleData = g_particleParams[input.billboard_index];
int subdiv = 2; // subdivide texture atlas
uint textID = (particleData.randomInt % (subdiv * subdiv));
int2 spriteToSample = int2((int)(textID % subdiv), (int)(floor(textID / subdiv)));

float2 cleanSpriteUV = ((input.textureCoordinate + (int2)spriteToSample) / subdiv);
float alphaMask = saturate(KEEN_TEX_2D(g_baseTexture, (cleanSpriteUV)).x );

// start glow colors
float3 color1 = float3(1, 0.001, 0);
float3 color2 = float3(0.83, 0.16, 0.01);
float3 colorEdge = float3(1, 0.01, 0);
float3 gradientColor = lerp(color2, color1, saturate(alphaMask) * (1 - radialAlpha(tileAndCenter(input.textureCoordinate, 2.5, 2.5))));

// fade to black towards the end
gradientColor = lerp(gradientColor, float3(0.0, 0.0, 0.0),  Ease(0.28, 0.37, particleData.age_life.x * particleData.age_life.y));				
float startGlow = lerp(radialAlphaSmooth(input.textureCoordinate, 0.007f)*0.3f, 0.0, Ease(0.20, 0.35, particleData.age_life.x * particleData.age_life.y));

// burnt edge
float outer = saturate((1 - step(alphaMask, edgeWidth + (particleData.age_life.x * 0.7f))) );
float inner = step(alphaMask, 1 - (particleData.age_life.x * 0.7f));
float edgeMask = inner * outer;

// mix everything
float edgeIntensity = 2.0f;
gradientColor = lerp(gradientColor, colorEdge * edgeIntensity, edgeMask);
alphaMask *= outer * (Ease(0.03, 0.10, particleData.age_life.x )); 
float brightness = 10.0f;
gradientColor *= brightness;
alphaMask = max(startGlow,alphaMask);
return half4(gradientColor, saturate(alphaMask));
{% endhighlight %}
</details>

## Leaves and Dust Effect

Consists of layers:

 - SandClouds
 - SingleFlakes
 - FlakeThreads (Trails)

This effect includes an option to have its movement controlled by a 4-point spline, allowing for complex trajectories - such as swirling motions, as seen in the right-hand video below.

 <div class="video-row vid-2" >
	<video autoplay muted loop>
	  <source src="/assets/videos/dustfx_cr_f.mp4?v=1" type="video/mp4">
	  Could not load the video
	</video >
	<video autoplay muted loop>
	  <source src="/assets/videos/dust_cr_f.mp4?v=1" type="video/mp4">
	  Could not load the video
	</video >
</div >

<div style="height: 20px;"></div>


<details>
<summary>Code snippet that samples the movement trajectory, for all dust effect layers</summary>
{% highlight cpp %}
float lerpPosition1 = (currentParticle.age / m_systemParameters.maxLifetime);
float lerpPosition2 = ((currentParticle.age + timeStep * m_layerParameters[layer].agingSpeed) / m_systemParameters.maxLifetime);

float3 point1 = lerp3(lerp3(m_systemParameters.splinePoints[0], m_systemParameters.splinePoints[1], lerpPosition1), lerp3(m_systemParameters.splinePoints[1], m_systemParameters.splinePoints[2], lerpPosition1), lerpPosition1);
float3 point2 = lerp3(lerp3(m_systemParameters.splinePoints[0], m_systemParameters.splinePoints[1], lerpPosition2), lerp3(m_systemParameters.splinePoints[1], m_systemParameters.splinePoints[2], lerpPosition2), lerpPosition2);
Vector3 vDir = Vector3(addFloat3(point2, scaleFloat3(point1, -1.0f)));
vDir.normalize();
currentParticle.dir = {vDir.x, vDir.y, vDir.z};
currentParticle.dir = scaleFloat3(currentParticle.dir, m_systemParameters.windSpeed);
{% endhighlight %}
</details>

### Flake Threads: 

This layer was designed to simulate trailing particles. The leading (or "head") and trailing particles are stored in a shared array and are distinguished by their indices. Head particles sample the main path and apply an optional wave-like offset, while each trailing particle inherits data from its corresponding head.

<details>
<summary>Code snippet that processes the particles from the FlakeThreads layer.</summary>
{% highlight cpp %}
size_t trailIndex = currentParticle.index % (m_layerParameters[layer].trailParticleCount + 1u);

if (trailIndex == 0) // head particle
{ 
	currentParticle.pos = getDirectionPath(currentParticle, timeStep );
	float randomScaler = keen::pf::max(((float)currentParticle.randomInt) / 100.f, 0.7f);
	float3 splinePathOffset = getWaveOffsetPerpendicular(currentParticle, viewMatrix, timeStep, time, m_systemParameters.waveFrequencyScaler * (0.2f * currentParticle.lifetime * m_systemParameters.windSpeed);
	currentParticle.pos = addFloat3(currentParticle.pos, splinePathOffset, m_systemParameters.waveAmplitudeScaler * 2.00f * randomScaler));

	Vector3 currentVelocity;
	currentVelocity.set(currentParticle.pos.x - currentParticle.prevPos.x, currentParticle.pos.y - currentParticle.prevPos.y, currentParticle.pos.z - currentParticle.prevPos.z);
	currentVelocity.normalize();

	currentParticle.currentVelocity = float3(currentVelocity);
	currentParticle.prevPos = currentParticle.pos;
}
else  // trail particle 
{
	ParticleParameters& frontParticle = m_particleParameters[layer][i-1u]; // get the parent
	currentParticle.pos = addFloat3(frontParticle.pos, scaleFloat3(frontParticle.currentVelocity, -1.0f * m_layerParameters[layer].trailParticleDistance));
	currentParticle.randomInt = frontParticle.randomInt + 1;
	currentParticle.age = frontParticle.age;
	currentParticle.lifetime = frontParticle.lifetime;
	currentParticle.currentVelocity = frontParticle.currentVelocity;
	currentParticle.prevPos = currentParticle.pos;
}
{% endhighlight %}
</details>

## Fog Effect

A simple effect made up of a single Base layer. It blends sprites from an atlas texture and supports configurable rotation speed.

<div class="video-row vid-2" >
	<video autoplay muted loop>
	  <source src="/assets/videos/fogfx_f.mp4?v=1" type="video/mp4">
	  Could not load the video
	</video >
	<video autoplay muted loop>
	  <source src="/assets/videos/fog_f.mp4?v=1" type="video/mp4">
	  Could not load the video
	</video >
</div >

## Level Examples

<video width="720px" autoplay muted loop >
    <source src="/assets/videos/fire_f.mp4?v=12" type="video/mp4">
	Could not load the video
</video >

<video width="720px" autoplay muted loop >
    <source src="/assets/videos/wind_f.mp4?v=2" type="video/mp4">
	Could not load the video
</video >

<video width="720px" autoplay muted loop >
    <source src="/assets/videos/wind_fire_cloud_f.mp4?v=2" type="video/mp4">
	Could not load the video
</video >