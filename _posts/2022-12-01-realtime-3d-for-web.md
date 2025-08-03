---
layout: post
---

<div style="height: 50px;"></div>

A series of small web-based experiments created using the Three.js library.
All geometry is constructed from basic primitive shapes provided by the library, unless stated otherwise. The camera uses OrbitControls, allowing users to zoom in and out with the mouse scroll wheel and adjust the viewing angle by click-and-dragging with the left mouse button. Below are live embeds of some of those exercises.
 

## Landscape Generator
A lightweight procedural terrain generator that uses a custom vertex-fragment shader and Marching Squares logic to create small, stylized island landscapes.
This script generates a cell-type map to define land regions, then applies Marching Squares to detect and outline the coastlines. This produces the height and  color buffers that are then fed into the land plane shader. The tree models are sourced from a [free sketchfab resource](https://sketchfab.com/3d-models/low-poly-tree-6d986e0b24b54d85a5354e5cac6207a1).

<iframe src="/assets/threejs/LandscapeGen.html" scrolling="no" frameborder="0"  style="width: 100%; aspect-ratio: 16 / 9; border: 1px solid;"></iframe>

## Snake Game

Use the **WASD** keys to start and control the game.
Only the first input within each 250 ms update cycle is registered. The source code can be viewed under [this link](https://github.com/kamilashi/Snake-Game). 

<iframe src="/assets/threejs/SnakeGame.html" scrolling="no" frameborder="0"  style="width: 100%; aspect-ratio: 16 / 9; border: 1px solid;"></iframe>

## 3D Clock

This local time clock was created as an exercise in orienting 3D objects within a scene. The source code can be viewed under [this link](https://github.com/kamilashi/Clock). 


<iframe src="/assets/threejs/Clock3D.html"  scrolling="no" frameborder="0"  style="width: 100%; aspect-ratio: 16 / 9; border: 1px solid;"></iframe>
