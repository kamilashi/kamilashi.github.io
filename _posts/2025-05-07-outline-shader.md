---
layout: post
---

<div style="height: 50px;"></div>

All objects in the scene have a "normal" sub-shader that controls the actual colors rendered on the screen, and an "outline" substitute sub-shader that controls what is written into the discontinuity map. The discontinuity map is then processed inside a compute kernel using a naive approach of pixel comparison. When the difference between the pixels is greater than a defined threshold, an outline is produced. The outline map is then mixed with the actual colors from the "normal" subshader and is rendered onto the screen.

![Alt text](/assets/images/outlines/discontinuity_map_full.png) 
*Discontinuity map*

## +

![Alt text](/assets/images/outlines/colors_full.png) 
*Actual color pass*

## =

![Alt text](/assets/images/outlines/outlines_full.png) 
*Final render*

<div style="height: 20px;"></div>

The grass blades are instanced procedurally, hence the use of a surface shader. All the other objects (two planes and a sphere) use a minimal custom vert-frag shader. Below is the snipped of the shader setup of the grass blades, that features the options for both the "normal" and the "outlines" shaders. Other objects, such as the grass plane, the sphere and the background plane have a similar setup that allows to control the actual colors and the colors that will end up in the discontinuity map.

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