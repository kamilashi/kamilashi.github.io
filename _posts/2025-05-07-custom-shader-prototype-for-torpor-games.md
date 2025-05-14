---
layout: post
---

<div style="height: 50px;"></div>

As part of my internship with Torpor Games, I created a stylized shader prototype that interoplates states based on the camera distance. The prototype was done in Unity Editor 2020.3.48.f1. The demo is available under [this link](https://github.com/kamilashi/Unity-Custom-Shader-Implementation/tree/main/DemoBuild) and can be executed by launching the CustomShader executable. 

<video width="720px" controls muted loop playsinline preload="metadata">
    <source src="/assets/videos/shaderproto_f.mp4?v=3" type="video/mp4">
	Could not load the video
</video >

<div style="height: 20px;"></div>

<details>
<summary>Code snippet that produces the shadow edge mask.</summary>
	{% include outline_compute_shader_code.html %}
</details>