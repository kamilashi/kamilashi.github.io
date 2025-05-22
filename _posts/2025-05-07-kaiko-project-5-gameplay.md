---
layout: post
---

<div style="height: 50px;"></div>

During my full-time employment at Kaiko as a Junior Programmer, I was responsible for several gameplay features, ranging from player traversal to enemy AI. All work was done for Project 5, an unreleased title based on a well-known THQ Nordic IP. The game was developed using an Entity Component System (ECS) architecture, where entities were defined by their components, and logic was implemented through dedicated systems operating on those components. Each component stored data and configuration specific to its associated entity, which was managed with the help of proprietary tools and converters. 

Throughout the process, I collaborated closely with a number of other departments, including Game Design, Art, Animation, VFX, Rendering, and Level Design. Many features were the result of tight cross-disciplinary coordination, and I was fortunate to work alongside incredibly skilled and talented people, many of whom I will mention later in this post.

## Wall Movement System

System that processes vertical and horizontal wall runs. An experimental iteraction features a manual switch of the wall run direction when reaching the "wall run extenders", while the default one has automatic wall run extension in the same direction. During a wall run, if a so called "wall-run target" is detected (wall run extender or a horizontal rail), the movement curve adjusts to always end up at a pre-defined position relative to the target, from which the transition animation could start playing. If an extender is detected below the player, the system either pulls the player closer to the extender to play the "jump-over" animation, or pulls away if a correct landing cannot be predicted. There are multiple transitions to a wall scrape, like after completing a vertical wall run that has no target or when failing to perform a corner jump during a horizontal wall run. 

<div style="height: 20px;"></div>

<div class="video-row vid-2" >
	<video autoplay muted loop playsinline preload="metadata">
	  <source src="/assets/videos/vwallrun_f.mp4?v=4" type="video/mp4">
	  Could not load the video
	</video >
	<video autoplay muted loop playsinline preload="metadata">
	  <source src="/assets/videos/hwallrun_f.mp4?v=4" type="video/mp4">
	  Could not load the video
	</video >
</div >

<div style="height: 1px;"></div>

*Vertical (left) and horizontal (right) wall runs with auto-extenders.*
 

<div style="height: 20px;"></div>

<!-- <video width="720px" controls muted loop playsinline preload="metadata">
    <source src="/assets/videos/mwallrun_f.mp4?v=4" type="video/mp4">
	Could not load the video
</video > -->

<iframe src="https://player.vimeo.com/video/1085447324?h=57a4ec6af9&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" width="720" height="405" frameborder="0" allow=" fullscreen; picture-in-picture" allowfullscreen></iframe>

<div style="height: 1px;"></div>

*Mixed wall runs with manual extenders.*

Manual extenders have an idle time-out after which the character automatically drops from the extender. Wall-run is only possible into the direction at which the wall is marked by a special "wall-runnable" material tag, which also serves as an indicator for the wall run type (vertical / horizontal).

When the player is in air, nearby walls are being detected with raycasts and checked against multiple conditions, like whether the wall has an appropriate material-tag, in which direction, if it isn't a corner and so on. This only returns info on all "possible" directions and the final decision is still dependent on the player's input direction. 

<details>
<summary>Code example of how the nearby walls are analyzed for a potential wall run.</summary>
	{% include wall_run_code.html %}
</details>

<!-- ## Slope Slide System

System that processes sliding down a non-walkable slope. -->

## Steering System

The steering system was implemented by combining the notion of [context maps](https://www.gameaipro.com/GameAIPro2/GameAIPro2_Chapter18_Context_Steering_Behavior-Driven_Steering_at_the_Macro_Scale.pdf) with <!-- the dynamic collision prediction by [Stephen J. Guy and Ioannis Karamouzas](https://www.gameaipro.com/GameAIPro2/GameAIPro2_Chapter19_Guide_to_Anticipatory_Collision_Avoidance.pdf) and --> the steering behaviors by [Craig W. Reynolds](https://www.red3d.com/cwr/steer/gdc99/). 

<!--<The hierarchy of system is displayed below, features I was responcible for marked with color: 

div style="text-align: center;">

 NPC Controller (enemy "brain" in a form of scripts) <br>
		| <br>
<b>sets the steering behavior and targets</b> <br>
		| <br>
		v <br>
<b>Steering System (processes the current behavior (seek, pursuit, flee), flocking and collision avoidance)</b> <br>
		| <br>
<b>passed down the desired movement direction</b> <br>
		| <br>
		v <br>
Ground Movement System (entity movement) 

</div>-->

![Alt text](/assets/images/kaiko/systems.png) 
*System hierarchy.*

In the video examples, the NPC controller sets the desired behavior like *pursuit* a dynamic target (the player), *flee* from the target (after attacking) and *seek* the spawn position (when the player goes out of range).

The system has two direction maps - an interest map and a danger map. The maps are represented by arrays of weights, each entry mapped onto a direction in world space. Map entries are created through "contributions" from various steering forces - the yellow debug text in the videos. Contributions from attracting and repelling forces are being written into the interest and the danger map respectively, in the end the normalized maps are superimposed and the result gets converted into a single direction. To reduce the direction jitter a running mean is applied.

The attracting forces are: **pursuit/pursuit with offset, seek, flee** and **flocking** behaviors. Repelling forces are: **static collision avoidance** and **dynamic collision avoidance (player and NPC movement)**. <!--The seeking behavior uses the target position as a static one, while pursuit takes into account the current speed of the target entity and predicts the position by using a modified version --> On the videos below, entities and their final desired directions are denoted by circles with a debug line, red and blue for the player (target) and the NPCs respectively. Each enemy reserves one attack slot around the player (attack scheduler done by [Tobias Opfermann](https://www.linkedin.com/in/tobias-opfermann-477179210/?originalSubdomain=de)) which becomes the offset for the pursuit target - denoted by magenta crosses. The weighted danger directions are shown by the red lines around the enemies, and valid interest directions after the subtraction by green.



<iframe src="https://player.vimeo.com/video/1085289445?h=25fce98fe4&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" width="720" height="405" frameborder="0" allow=" fullscreen; picture-in-picture" allowfullscreen></iframe>
*A small group of enemies, switches between pursuit, flee and seek behaviors.*

<!-- <div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/1085289445?h=25fce98fe4&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Gameplay: Enemy Steering - Small Group"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>-->

<div style="height: 30px;"></div>

<iframe src="https://player.vimeo.com/video/1085290416?h=a4679863c2&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" width="720" height="405" frameborder="0" allow=" fullscreen; picture-in-picture" allowfullscreen></iframe>
*A larger group of enemies navigating around the static collision.*


## Interactable System

Processes what is (usually) a pair of interacting entities (interactor and interactable) in a state machine. The state machine can be logically split into:

- Positioning both entities at predefined positions (if needed)
- Playing synced animations (if available)
- Handling interaction outcomes

Every interactable entity gets an "Interactable" component. Each of such interactables can have an arbitrary number of transitions defined in its setup data. Transitions hold their requirements, setup for the "body" of the interaction itself (animations, which steps from the state machine to process and how) and the interaction outcome. This allows for a context-based choise of the current available interaction. For example, interacting with an object from behind could have different animations than interacting from the front. The context in which a certain transition should be triggered is defined in the "Requirements" part of the transition's setup. Examples of that could be: interactor type (player, npc, object, etc), directoin from interactable, initial state of the interactable and so on. 

The setup for the interaction "body" can define a skip of the positioning part or cut directly to the outcome, i.e. instant interaction. The latter was especially useful for auto-triggered interactions like throwing objects that trigger other objects or stepping on platform-switches. 

The outcome setup is the most compact one, and is mainly used to exit the interaction into a specific gameplay action, like a quick time event, other than giving the player back the movement controls.

<!-- The system also allowed to temporarily spawn additinal animated models.  -->

The system is also responsible for filtering the nearby interactables and their transitions. Only one interaction can be available at a time, with the exception for the auto-triggered ones (E.g. picking up an object while stepping onto a platform-switch is still possible). Having a clear view of the priority of the filtering conditions allowed to easily cash out the "potential interactions" to be later used for displaying player-hints.

Examples of interactions: pulling/pushing levers, picking up objects, executing enemies, initiating dalogues, etc.

<details>
<summary>The code that looks for the available transition within one interactable object.</summary>
	{% include interactable_code.html %}
</details>

<div style="height: 20px;"></div>

<!-- <video width="720px" autoplay muted loop playsinline preload="metadata">
    <source src="/assets/videos/chests_f.mp4?v=4" type="video/mp4">
	Could not load the video
</video > -->

<iframe src="https://player.vimeo.com/video/1085462219?h=10cd5d3a97&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" width="720" height="405" frameborder="0" allow=" fullscreen; picture-in-picture" allowfullscreen></iframe>

<div style="height: 1px;"></div>

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

In hindsight, a separate system for processing the positioning of entities during an execution would've made more sence, as it required a very different behavior than the regular interactions did and resulted in a lot of special code to handle all the corner cases.

## Carriable System

System that processes entering and exiting the carrying state, handles some special cases. When the place command is given by the player the system performs a number of radial ground checks around the player, in order to place the object on a collision-free ground. Picking the objects up, socketing them in and out are interactions and are processed by the Interactable system. 

<iframe src="https://player.vimeo.com/video/1085470271?h=2e21ed7e15&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" width="720" height="405" frameborder="0" allow=" fullscreen; picture-in-picture" allowfullscreen></iframe>
*Sphere VFX by [Adrian Vögtle](https://exaii.artstation.com/).*

<!-- <div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/1085470271?h=2e21ed7e15&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Gameplay: Carry Heavy Objects"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script> -->

The carried object gets parented to the player via the **Attachment System**, to which I contributed by creating an attachment type that keeps the original child orientation and addding interpolation option to smoothely match the child orientation, facing and position with those of the parent.

## Quick Time Event system

System that registers button presses and fills up a smoothed progress bar. The linear progress is incremented with each button press, and the blended progress catches up with it using [lerp-damping](https://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/). QTE fails if no input is given within a certain time. There is an option to attach sound and visual effects to progress and/or regress points, which will be triggered by the system.  

<!-- <video width="720px" autoplay muted loop playsinline preload="metadata">
    <source src="/assets/videos/qte_f.mp4?v=6" type="video/mp4">
	Could not load the video
</video > -->

<iframe src="https://player.vimeo.com/video/1085459902?h=16a97251ed&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" width="720" height="405" frameborder="0" allow=" fullscreen; picture-in-picture" allowfullscreen></iframe>


*The linear progress is rendered with the yellow bar, while the blended progress is rendered with the green one. There is also a 20% progress VFX event. Switch model by [Clemens Petri](https://miesepetri.artstation.com/), animations by [Phi Kernbach](https://hirngespinst.artstation.com/)*.

## Boss Fight

During the development, I was responcible for a few enemy units. Adding an enemy unit into the runtime involved creating and setting up its entity template, requesting the missing animations and implementing custom logic inside the enemy behavior stripts. The behavior scripting environment was provided by Tobias Opfermann. For this post, I singled out the boss unit, due to its unique design and a high level of interdisciplinary complexity.

Apart from the 2 health-stages and their attacks, the design incorporated the surroundings of the boss arena. Part of the battle logic I implemented resided in the level scripts, level scripting environment provided by [Markus Wall](https://portfolio.rpg-hacker.de/). The VFX were created by [Adrian Vögtle](https://exaii.artstation.com/) and [Alexandra Anokhina](https://pyrrhulla.xyz/), boss animations outsourced from Metricminds. Player combat system created by [Pascal Scheuber](https://pascalscheuber.wixsite.com/portfolio).

<iframe src="https://player.vimeo.com/video/1086475744?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" width="720" height="405" frameborder="0" allow=" fullscreen; picture-in-picture" allowfullscreen></iframe>
*The battle features a special arena-wide attack, where the boss becomes invincible and "summons" the trees which have to be destroyed before the attack ends. If the player manages to do so, the boss becomess stunned, otherwise the player gets damaged by the explosion. The video shows both outcomes (fail ; success).*



<!--
```
float exp = 2.718281828459f;
float lerpTarget = 1.0f - keen::pf::pow(exp, -1.0f * QuickTimeEventSystem::s_quickTimeEventBlendDamp * timeStep);
float blendedProgress = keen::lerp(blendedProgress, linearProgress, lerpTarget); 
```

*Blended progress uses frame-rate independend damping.*-->