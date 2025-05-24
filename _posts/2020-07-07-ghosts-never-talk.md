---
layout: post
---

<div style="height: 50px;"></div>

This ongoing project is being developed by a three-person team: [Violetta Pavlovskaia](https://www.artstation.com/puba) (Art & Animation), [Maksim Akulov](https://www.artstation.com/akulov) (Story & Gamedesign) and myself (Programming). The source code can be viewed under this [link](https://github.com/kamilashi/ghosts_never_talk/tree/prototype) and the demo is available [here](https://github.com/kamilashi/ghosts_never_talk/tree/build). <!-- The demo is available under [this link]() by launching the  --> 

The prototype is a 2.5D side-view adventure that mixes 2D and 3D graphics. It feeatures mostly bi-directional movement (left/right) and only occasional jumps between "ground layers" - hence the 2.5 aspect. It is planned to incorporate puzzles solved by interacting with various objects, as well as enemy characters that will require a stealthy walkthrough. The engine of choise is Unity 2022.3.42f1, using the Universal Render Pipeline. Below is a breakdown of some of the already implemented features. There is footage of the current state of the prototype at the end of this article.


## Spline Movement

Given the relative simplicity of the characters' movement and the deliberate design choice to exclude jumping, I opted to move away from collision-based movement and instead implement pre-defined Catmull-Rom spline paths. The splines consist of nodes, which dictate what happens to the characters while walking over them. The idea is for the environment to apply states directly (like kill zones, movement blockers, slowdowns, potential interactions, etc) rather than the characters dynamically probing their surroundings. The other point of the spline-based movement was to have more control over where the characters end up and to reduce the complexity of AI steering. 

Each walkable "ground layer" is bound to exactly one spline, each spline can have an arbitrary number of nodes with unrestricted distances (subject to change). During movement, the desired speed scaled by direction and the timestep is passed down to the Spline, that samples the current position on the spline as a scalar from 0 to splineLength and converts it into the world position which is returned back to the MovementSystem and is applied onto the character. In order to perform gameplay-related actions, like checking ranges and distances entities only need to keep track of their current scalar position on the spline, instead of world-position vectors.

![Alt text](/assets/images/ghosts/editorscene2.png)
*Editor view of the demo scene, with 3 ground layers from 0 (closest) to 2 (farthest).*

<!-- <details>
<summary>Code snippet that samples the current position on the spline, as well as some other gampley-specific info.</summary>
	{% include gnt_spline_movement_code.html %}
</details> -->

## A* Path Finding

The code finds the shortest path between the source node and the target node, considering only the already visited nodes. At the moment it is implemented as part of the respawn feature, to visualize the "the progress setback" instead of an instant teleport-respawn. The two videos below show auto-steering along the shortest path returned by the A* search.

<div class="video-row vid-2" >
	<video autoplay muted loop playsinline preload="metadata">
	  <source src="/assets/videos/pathfinding_unexplored_f.mp4?v=1" type="video/mp4">
	  Could not load the video
	</video >
	<video autoplay muted loop playsinline preload="metadata">
	  <source src="/assets/videos/pathfinding_explored_f.mp4?v=1" type="video/mp4">
	  Could not load the video
	</video >
</div >
*Before (left video) and after (right video) having explored the actual shortest path.*

## Camera Movement

The main camera in the prototype is tasked with the following:

- Follow the player with lookahead
- Make sure the current layer's "camera hook" stays at the bottom of the screen
- Dolly in and out on demand (like when interacting with teleports or other special actions yet to come)

The movement interpolation is done using the [lerp-damping](https://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/), and has different damp-values for regular, smooth movement (like following the player during walking) and fast, abrupt position changes (like following the player during teleportations.)

When the player goes up the spline, to keep the player within the relative center of the screen and have the screen bottom tied to the camera hook height, the camera automatically dollies backwards - this behavior can be seen when walking over the bridge and up the strairs.

<!-- <details>
<summary>Camera update code</summary>
	{% include gnt_camera_movement_code.html %}
</details> -->

Code snippet that snaps the screen bottom to the y position of the camera hook and dollies back to keep the player in view.

``` csharp
// match screen bottom with the hook by setting the camera's y position
float referenceExtentY = (activeGroundLayerRef.ScreenBottomHook.transform.position.z - transform.position.z) * (float)System.Math.Tan(mainCamera.fieldOfView * 0.5 * (System.Math.PI / 180.0));
fitScreenBottomHookY = activeGroundLayerRef.ScreenBottomHook.transform.position.y + referenceExtentY;
predictedCameraPosition.y = fitScreenBottomHookY;
cameraHeightChangeReference = fitScreenBottomHookY;

// dolly the camera back when going up 
float playerPosDifferenceY = cameraHeightChangeReference - (thisFramePlayerPosition.y + cameraHeightChangeThreshold);
float dollyAmount = System.Math.Min(System.Math.Abs(playerPosDifferenceY), maxDollyAmount);
float dollyDirection = System.Math.Sign(playerPosDifferenceY);

predictedCameraPosition.z += dollyDirection * dollyAmount;
```

## Gameplay Demo

<!-- <video width="720px" controls muted loop playsinline preload="metadata">
    <source src="/assets/videos/gnt_f.mp4?v=4" type="video/mp4">
	Could not load the video
</video > -->
<!-- autoplay; -->

<!-- <div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/1085071250?h=ec64e917bb&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Ghosts Never Talk Demo"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script> -->

<iframe src="https://player.vimeo.com/video/1085071250?h=ec64e917bb&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" width="720" height="405" frameborder="0" allow=" fullscreen; picture-in-picture" allowfullscreen></iframe> 

*The video shows some additional gameplay features, like ground layer switching, teleport interactions and a dialogue. The dialogue system is powered by the Yarn Spinner package.*

