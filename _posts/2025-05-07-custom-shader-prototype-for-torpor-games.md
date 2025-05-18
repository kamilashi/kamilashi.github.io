---
layout: post
---

<div style="height: 50px;"></div>

As part of my internship with Torpor Games, I created a stylized shader prototype that interoplates states based on the camera distance. The prototype was done in Unity Editor 2020.3.48.f1. The demo is available under [this link](https://github.com/kamilashi/Unity-Custom-Shader-Implementation/tree/main/DemoBuild) and can be ran by launching the CustomShader executable. 

All objects in the scene use the same shader. The shader supports the use of tiled textures as a grayscale mask for interpolating a set of colors - a pair for the "far" state, and a pair for the "close" state (Example: the wallpaper and the carpet), as well as a noise texture that works in a similar manner (stains on the carpet). The carpet itself is constructed out of 3 planes, each with its own material, to display different configurations for the same shader. The shadow edge width and color can be configured or the edge can be disabled at all. Global shadows are optional as well. There is an additional setting to enable "fake" shadow which takes an arbitrary "light" direction and a pair of colors for the shaded/lit areas that - this is used to define the shapes of otherwise flat shaded objects better, the effect can be seen on the window frame, the couch and the small table.

<!-- <video width="720px" controls muted loop playsinline preload="metadata">
    <source src="/assets/videos/shaderproto_f.mp4?v=3" type="video/mp4">
	Could not load the video
</video > -->

<iframe src="https://player.vimeo.com/video/1085267362?share=copy" width="720" height="405" frameborder="0" allow=" fullscreen; picture-in-picture" allowfullscreen></iframe>

<div style="height: 20px;"></div>

<details>
<summary>Code snippet that produces the shadow edge mask.</summary>
	{% include custom_shader_prototype_code.html %}
</details>