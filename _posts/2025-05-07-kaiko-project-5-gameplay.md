---
layout: post
---

<div style="height: 50px;"></div>

During my full-time employment at Kaiko I created severall gameplay systems for the unreleased project 5 from a beloved THQNordic IP. The project was done in ECS, with entities being defined by their components, that held the data and settings and operated on by systems. The in-game instances of such entities were managed with the help of proprietary tools. All system code was written in C++.


## Interactable System

Processes a (usually) pair of interacting entities (interactor and interactable) in a state machine. The state machine can be logically split into:

- Positioning both entities at predefined positions (if needed)
- Playing synced animations (if available)
- Handling interaction outcomes

If an entity can be interacted with it would get an "Interactable" component. Each of such interactables could have an arbitrary number of transitions defined in its setup data. Transitions held their requirements, setup for the "body" of the interaction itself (animations, which steps from the state machine to process and how) and the interaction outcome. This allowed for a context-based choise of the current available interaction. For example, interacting with an object from behind could have different animations than interacting from the front. Context was defined in the "Requirements" part of the transition's setup. Examples of that could be: interactor type (player, npc, object, etc) directoin from interactable, initial state of the interactable and so on. 

The setup for the interaction "body" could skip the positioning part or cut directly to the outcome, i.e. instant interaction. The latter was especially useful for auto-triggered interactions like throwing objects that activate something when coming in range or stepping on platform-switches. 

The outcome setup is the most compact one, and was mainly used to exit the interaction into a specific gameplay action, like triggering a quick time event other than giving the player back the movement controls.

<!-- The system also allowed to temporarily spawn additinal animated models.  -->

The system was also responsible for filtering the nearby interactables and their transitions. Only one interaction could be available at a time, with the exception for the auto-triggered ones (E.g. picking up an object while stepping onto a platform-switch was still possible). Having a clear view of the priority of the filtering conditions allowed to easily cash out the "potential interactions" to be later used for displaying player-hints.

Examples of interactions: pulling/pushing levers, picking up objects, executing enemies, initiating dalogues, etc.

<details>
<summary>Code example of how the current available interaction and transition is chosen.</summary>
	{% include interactable_code.html %}
</details>

<div style="height: 20px;"></div>

<video width="720px" autoplay muted loop >
    <source src="/assets/videos/chests_f.mp4?v=1" type="video/mp4">
</video >

*An example of how the different close-to-open transitions are chosen based on the interactor character and the interaction direction. The direction ranges defined for this particular chest type are visualized with red lines. The blue cross denotes the interaction position from which the animation will trigger, and can also be defined per transition. In this example - the characters will position themselves a bit further from the chest when interacting near its corner. Some models (like the instrument of the male character) are not rendered due to the NDA.*


<!-- <div class="video-row" >
	<video autoplay muted loop >
	  <source src="/assets/videos/switch_push_pull_f.mp4" type="video/mp4">
	</video >
	<video autoplay muted loop >
	  <source src="/assets/videos/switch_throw_f.mp4" type="video/mp4">
	</video >
</div >

*As are different types ofdete interactors (character on the left, bomb on the right - the aiming and throwing are not part of the interaction, only the "detection" of the bomb as a predefined interactor type and the corresponding behavior)...* -->


In hindsight, I would've probably build a separate system for processing the positioning of interacting entities during the execution, as it required a very different behavior than the regular interactions did and resulted in a lot of special code to handle all the corner cases.

## Carriable System

System that processes carrying objects and placing them, handles some special cases.

## Wall Movement System

System that processes vertical and horizontal wall runs. An experimental iteraction featured manual switch of wall run direction when reaching so-called "wall run extenders", while the default one had automatic wall run extension in the same direction.

The detection of a potential wall run was done outside of the wall-run system

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

The steering system was built by combining the idea of [context maps](https://www.gameaipro.com/GameAIPro2/GameAIPro2_Chapter18_Context_Steering_Behavior-Driven_Steering_at_the_Macro_Scale.pdf) with the steering behaviors described by [Craig W. Reynolds](https://www.red3d.com/cwr/steer/gdc99/). 


## Quick Time Event system

System that registers button presses and fills up a smoothed progress bar. The linear progress is incremented with each button press, and the blended progress catches up with it using [lerp-damping](https://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/). QTE fails if no input within a certain time. It also plays sound and visual effects attached to progress and/or regress points.

```
float exp = 2.718281828459f;
float lerpTarget = 1.0f - keen::pf::pow(exp, -1.0f * QuickTimeEventSystem::s_quickTimeEventBlendDamp * timeStep);
float blendedProgress = keen::lerp(blendedProgress, linearProgress, lerpTarget); 
```

*Blended progress uses frame-rate independend damping.*