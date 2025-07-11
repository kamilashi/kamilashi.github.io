---
layout: post
---

<div style="height: 50px;"></div>

This small numerical calculator is an updated version of an old university project I did back in 2018. The original project was written in C# using Windows Forms and served as a launcher for a series of console apps written in C. The apps performed various calculus operations described in *"Numerical Methods for Engineers"* by  Steven Chapra and Raymond Canale. In the new version, I rewrote all the calculators in C++, keeping the original logic unchanged wherever possible. The new GUI uses the Qt6 library and mimics the original console-style input and output.

The current project is split into the UI and the logic layer, and this separation is reflected in the project structure. The logic resides in a separate module, which is accessed by the UI through an interface class defined in one of the module's header files. The MainWindow class is responsible for handling user interactions, routing requests to the logic module through the Approximator class object, fetching output data, and presenting it to the user. The Approximator holds and manages a set of Program instances (each representing a numerical method); each Program is responsible for its own workflow, input handling, and formatting its output.  The source code, together with the build can be found via [this link](https://github.com/kamilashi/Numerical-Approximator-Qt).

<div style="height: 20px;"></div>

<div class="video-embed">
	<iframe src="https://player.vimeo.com/video/1100617844?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" width="720" height="405" frameborder="0" allow=" fullscreen; picture-in-picture" allowfullscreen></iframe> 
</div>

<div style="height: 1px;"></div>

*Numerical approximator in action.*