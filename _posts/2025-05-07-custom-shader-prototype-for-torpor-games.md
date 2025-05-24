---
layout: post
---

<div style="height: 50px;"></div>

As part of my internship at Torpor Games, I created a shader prototype as a proof of concept for an original art style that I researched and developed. The core idea was to have the shader interoplate visual states based on the camera distance. The prototype was built in Unity Editor 2020.3.48.f1. The demo is available under [this link](https://github.com/kamilashi/Unity-Custom-Shader-Implementation/tree/main/DemoBuild) and can be launched by running the CustomShader executable. 

All objects in the scene use the same shader. The shader supports the use of a tiled texture as a grayscale mask for interpolating between two main color pairs - one set for the "far" state and another for the "close" state (as seen in the wallpaper and carpet). The second texture input is for a noise texture, used to blend states in a similar manner - for example, to simulate stains on the carpet. The carpet itself is composed of three planes, each using a different material setup to demonstrate how multiple configurations of the same shader can be combined to create artistic effects. 

The shader includes an optional shadow edge effect, with configurable width and color. Global shadows are optional as well. An additional setting enables "fake" shading, which uses a user-defined light direction and a pair of colors for the lit and shaded areas. This is particularly useful for giving depth to otherwise flat-shaded objects. The "fake" shading effect can be observed on the window frame, couch, and small table in the scene.

<!-- <video width="720px" controls muted loop playsinline preload="metadata">
    <source src="/assets/videos/shaderproto_f.mp4?v=3" type="video/mp4">
	Could not load the video
</video > -->

<iframe src="https://player.vimeo.com/video/1085267362?h=bbcfbc1f3e&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" width="720" height="405" frameborder="0" allow=" fullscreen; picture-in-picture" allowfullscreen></iframe>

<div style="height: 20px;"></div>

<details>
<summary>Code snippet that produces the shadow edge mask.</summary>
	{% include custom_shader_prototype_code.html %}
</details>

<!-- The goal of the prototype shader was to achieve a clean, minimalistic and flat look, with emphasis on select decorative materials like textiles or tilework. This visual direction was inspired by figuratice and abstract art of the past century. A strong focus was placed on "framing" the composition with negative space, allowing colors of different objects to sometimes "bleed into" one another - a common technique in illustration, that would add a unique visual style to the rendered image. -->

