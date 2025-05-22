---
layout: post
---

<div style="height: 50px;"></div>

A small experiment I did during my studies. All objects in the scene use a "normal" sub-shader to control the actual colors rendered on the screen, and an "outline" substitute sub-shader to determine what is written into the discontinuity map. This map is then processed in a compute kernel using a naive pixel comparison approach. When the difference between neighboring pixels exceeds a defined threshold, an outline is generated. The resulting outline map is then combined with the colors from the "normal" sub-shader and rendered to the screen.

![Alt text](/assets/images/outlines/discontinuity_map_full.png) 
*Discontinuity map*

## +

![Alt text](/assets/images/outlines/colors_full.png) 
*Actual color pass*

## =

![Alt text](/assets/images/outlines/outlines_full.png) 
*Final render*

<div style="height: 20px;"></div>

The grass blades are instanced procedurally, hence the use of a surface shader. All other objects (two planes and a sphere) use a minimal custom vertex-fragment shader. Below is a snippet of the shader setup for the grass blades, featuring options for both the "normal" and the "outlines" shaders. Other objects—such as the grass plane, the sphere, and the background plane—use a similar setup that allows control over both the actual rendered colors and the colors written to the discontinuity map.

![Alt text](/assets/images/outlines/editor.png) 
*Shader setup for the grass blades.*

<div style="height: 20px;"></div>


Changing the discontinuity map color of the sphere in the following way -
![Alt text](/assets/images/outlines/discontinuity_map_edited.png) 
*Discontinuity map with the sphere blending in with the background.*

<div style="height: 20px;"></div>

results in the final render:
![Alt text](/assets/images/outlines/outlines_edited.png) 
*Final render with the outline-less sphere.*

<div style="height: 20px;"></div>

<details>
<summary>Code snippet of the outline kernel.</summary>
	{% include outline_compute_shader_code.html %}
</details>