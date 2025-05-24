---
layout: post
---

<div style="height: 50px;"></div>

This ongoing project is being developed by a three-person team: [Violetta Pavlovskaia](https://www.artstation.com/puba) (Art & Animation), [Maksim Akulov](https://www.artstation.com/akulov) (Story & Gamedesign) and myself (Programming). The source code can be viewed under this [link](https://github.com/kamilashi/ghosts_never_talk/tree/prototype) and the demo is available [here](https://github.com/kamilashi/ghosts_never_talk/tree/build). <!-- The demo is available under [this link]() by launching the  --> 

The prototype is a 2.5D side-view adventure that mixes 2D and 3D graphics. It features primarily bi-directional movement (left and right), with only occasional jumps between "ground layers" - hence the "2.5D" designation. The game is planned to incorporate puzzle-solving through object interactions as well as enemy encounters that require a stealthy walkthrough. The engine of choise is Unity 2022.3.42f1, using the Universal Render Pipeline. Below is a breakdown of some of the features already implemented. Footage of the prototype's current state can be found at the end of this post.

## Spline Movement

Given the relative simplicity of character movement and the deliberate design choice to exclude jumping, I chose to move away from collision-based movement in favor of predefined Catmull-Rom spline paths. The splines are composed of nodes that dictate gameplay behavior as characters traverse over them. The idea is for the environment to directly operate on the characters - kill zones, movement blockers, slowdowns, or potential interactions - rather than having the characters dynamically probe their surroundings. Another key reason for using spline-based movement was to gain precise control over character positioning and to reduce the complexity of AI steering.

Each walkable "ground layer" is bound to a single spline, each spline can contain an arbitrary number of nodes spaced at unrestricted intervals (subject to change). During movement, the desired velocity is passed down to the spline, which samples the character's current scalar position (from 0 to spline length) and converts it into the world position. <!-- This world position is then returned to the Movement System and applied to the character. --> To perform distance-related operations, entities only need to track and operate on their scalar positions along the spline, rather than their full world-space coordinates.

![Alt text](/assets/images/ghosts/editorscene2.png)
*Editor view of the demo scene, with three ground layers and splines. <!--from 0 (closest) to 2 (farthest).-->*

<!-- <details>
<summary>Code snippet that samples the current position on the spline, as well as some other gampley-specific info.</summary>
	{% include gnt_spline_movement_code.html %}
</details> -->

## A* Path Finding

This system calculates the shortest path between a source node and a target node, considering only already visited nodes. At the moment it's implemented as part of the respawn feature. The idea is to visualize the player's progress setback by automatically guiding the character back to the last checkpoint, rather than teleporting them. The two videos below demonstrate auto-steering along the shortest path returned by the A* search algorithm.

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

The main camera in the prototype is responsible for:

- Following the player with **lookahead** offset
- Ensuring the current layer's camera hook remains **anchored to the bottom of the screen**
- **Dollying in/out** on demand (e.g., triggered by teleportation or other special actions)

Camera position is interpolated using the [lerp-damping](https://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/), with different damping values for smooth tracking (e.g., walking) versus rapid repositioning (e.g., teleporting).

When the player ascends a spline, the camera automatically dollies back to keep the player centered (+ scaled lookahead), while maintaining the camera hook at the bottom of the screen. This behavior is visible when the player walks across the bridge and up the stairs.

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

