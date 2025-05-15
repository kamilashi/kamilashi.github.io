---
layout: post
---

<div style="height: 50px;"></div>

This project is a work in progress of a 3-person team: [Violetta Pavlovskaia](https://www.artstation.com/puba) (Art & Animation), [Maksim Akulov](https://www.artstation.com/akulov) (Story & Gamedesign) and yours truly (Code). <!-- The demo is available under [this link]() by launching the  --> 

The prototype a 2.5 sidescroller that mixes 2D and 3D graphics. It feeatures mostly bi-directional movement (left/right) and only occasional jumps between "ground layers" - hence the 2.5 aspect. It is planned to incorporate puzzles solved by interacting with various objects, as well as enemy characters that will require a stelthy walkthrough. The engine of choise is Unity 2022.3.42f1. Below is a breakdown of some of the already implemented features. There is footage of the current state of the prototype at the end of this article.


## Spline Movement

Due to the relative simplicity of the characters' movement and the design-choise not to implement character jumping the decision was made to stray away from the collision-based movement in favor of pre-determined Catmull-Rom spline paths. Splines consist of nodes, which dictate what happens to the characters visiting the nodes. The idea is for the environment to apply states directly (like kill zones, movement blockers, slowdowns, potential interactions, etc) rather than the character entities dynamically probing their surroundings. The other purpose of the spline-based movement is to have more control over where the characters end up and to reduce the complexity of AI steering. 

Each walkable "ground layer" is bound to exactly one spline, each spline can have an arbitrary number of nodes with unrestricted distances (is subject to change). During movement, the desired speed scaled by direction and the timestep is passed down to the Spline, that samples the current position on the spline as a scalar from 0 to splineLength and converts it into the world position which is returned back to the MovementSystem and is applied onto the character. In order to perform gameplay-related actions, like checking ranges and distances entities only need to keep track of their current scalar position on the spline, instead of world-position vectors.

![Alt text](/assets/images/ghosts/editorscene2.png)
*Editor view of the demo scene, with 3 ground layers from 0 (closest) to 2 (farthest).*

<details>
<summary>Function code that takes in the velocity and samples the current position on the spline, as well as other gampley-specific information.</summary>
	{% include spline_movement_code.html %}
</details>

## A* Path Finding

The code finds the shortest path between the source node and the target node, considering only the already visited nodes. At the moment is implemented as part of the respawn feature, to visualize the "the progress setback" instead of an instant teleport-respawn. The two videos below show auto-steering along the shortest path returned by the A* search.

<div class="video-row vid-2" >
	<video controls muted loop playsinline preload="metadata">
	  <source src="/assets/videos/pathfinding_unexplored_f.mp4?v=1" type="video/mp4">
	  Could not load the video
	</video >
	<video controls muted loop playsinline preload="metadata">
	  <source src="/assets/videos/pathfinding_explored_f.mp4?v=1" type="video/mp4">
	  Could not load the video
	</video >
</div >
*Left: before having explored the actual shortest path; right: after having explored the actual shortest path*

## Camera Movement

Camera in the prototype is tasked with the following:

- Follow the player with lookahead
- Make sure the current layer's "camera hook" stays at the bottom of the screen
- Dolly in and out on demand (like when interacting with teleports or other special actions yet to come)

The movement interpolation is done using the [lerp-damping](https://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/), and has different damp-values for regular, smooth movement (like following the player during walking) and fast, abrupt position changes (like following the player during teleportations.)

When the player goes up the spline, to keep the player within the relative center of the screen and have the screen bottom tied to the camera hook height, the camera automatically dollies backwards - this behavior can be seen when walking over the bridge and up the strairs.

## Gameplay Demo

<video width="720px" controls muted loop playsinline preload="metadata">
    <source src="/assets/videos/gnt_f.mp4?v=4" type="video/mp4">
	Could not load the video
</video >