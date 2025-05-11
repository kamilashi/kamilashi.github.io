---
layout: post
---

<div style="height: 50px;"></div>

During my full-time employment at Kaiko I created severall gameplay systems for the unreleased project 5 from a beloved THQNordic IP. The project was done in ECS with entities being defined by their components, that hold the data and settings to be operated on by systems. All system code is written in C++ in a proprietary engine.


## Interactable System

Interacting entities are processed in a state machine that is responsible for:

- Positioning both entities at predefined positions (if needed)
- Playing synced animations (if available)
- Handling interaction outcomes

Each interactable can have an arbitrary number of transitions defined in it's setup data. Transitions hold the requirements, setup for the interaction itself (animations, which steps from the state machine to process and how) and the interaction outcome. This allows for context-based choise of interactions. For example, interacting with an object from behind can have different animations than interacting from the front. Context is defined in the "Requirements" part of the transition's setup. Examples of that could be: interactor type, directoin from interactable, initial state of the interactable, etc. The system also allows to temporarily spawn additinal models animated along the interaction. 

Examples of interactions: pulling/pushing levers, picking up objects, executing enemies, initiating dalogues, etc.

<details>
<summary>Code example of how the current available interaction and transition is chosen.</summary>
	{% include interactable_code.html %}
</details>


<div style="height: 20px;"></div>

<div class="video-row" >
	<video autoplay muted loop controls >
	  <source src="/assets/videos/switch_push_f.mp4" type="video/mp4">
	</video >
	<video autoplay muted loop controls >
	  <source src="/assets/videos/switch_pull_f.mp4" type="video/mp4">
	</video >
</div >

*The interactable's (switch) state (on/off) is part of the transition requirements.*

<div class="video-row" >
	<video autoplay muted loop controls >
	  <source src="/assets/videos/switch_push_pull_f.mp4" type="video/mp4">
	</video >
	<video autoplay muted loop controls >
	  <source src="/assets/videos/switch_throw_f.mp4" type="video/mp4">
	</video >
</div >

*As are different types ofdete interactors (character on the left, bomb on the right - the aiming and throwing are not part of the interaction, only the "detection" of the bomb as a predefined interactor type and the corresponding behavior)...*

<div class="video-row" >
	<video autoplay muted loop controls >
	  <source src="/assets/videos/open_side_fc.mp4" type="video/mp4">
	</video >
	<video autoplay muted loop controls >
	  <source src="/assets/videos/open_front_3fc.mp4" type="video/mp4">
	</video >
</div >

*...Or the interaction direction, defined by angle ranges*

## Carriable System

System that processes carrying objects and placing them, handles some special cases.

## Quick Time Event system

System that registers button presses and fills up a smoothed progress bar. The linear progress is incremented with each button press, and the blended progress catches up with it using [lerp-damping](https://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/). QTE fails if no input within a certain time. It also plays sound and visual effects attached to progress and/or regress points.

```
float exp = 2.718281828459f;
float lerpTarget = 1.0f - keen::pf::pow(exp, -1.0f * QuickTimeEventSystem::s_quickTimeEventBlendDamp * timeStep);
float blendedProgress = keen::lerp(blendedProgress, linearProgress, lerpTarget); 
```

*Blended progress uses frame-rate independend damping*


## Wall Movement System

System that processes vertical and horizontal wall runs. An experimental iteraction featured manual switch of wall run direction when reaching so-called "wall run extenders", while the default one had automatic wall run extension in the same direction.

<details>
<summary>Code example of how wall is analyzed for a potential wall run.</summary>
	{% include wall_run_code.html %}
</details>

When a wall run target is detected, the movement curve adjusts to always end up at a pre-defined position from which the animation could start playing.

<span style="color: red; font-weight: bold;">Inserc video with debug rendering of the curve.</span>

## Wall Scrape System

System that processes a special state after colliding with a wall.

## Slope Slide System

System that processes sliding down a non-walkable slope.

## Steering System

The steering system was built combining the notion of [context maps] (https://www.gameaipro.com/GameAIPro2/GameAIPro2_Chapter18_Context_Steering_Behavior-Driven_Steering_at_the_Macro_Scale.pdf) with the steering behaviors by [Craig W. Reynolds] (https://www.red3d.com/cwr/steer/gdc99/). 
