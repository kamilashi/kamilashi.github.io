---
layout: post
---

During my part-time employment at Kaiko I created 3 particle effects, designing and implementing their behavior (C++, engine side) and visuals (HLSL, graphics side). The early iteration of the particle engine itself was provided by [Jan Enders](https://aldurethar.github.io/kkp5-particles).

Each particle effect consists of an arbitrary number of layers, each layer can be thought of as a collection of particles grouped by their shared material, shader and movement behavior. All particles have the *same* set of properties, mostly defined per layer, simetimes per particle (like those that require randomization), sometimes globally for the entire effect (like wind direction, scale, root position and so on).

## Fire Effect

The fire effect consists of the following layers:
 
 - Base
 - Glow
 - Flames
 - Embers
 - Sparks


## Leaves and Dust Effect

 - SandClouds
 - SingleFlakes
 - FlakeThreads (Trails)

## Fog Effect

- Base