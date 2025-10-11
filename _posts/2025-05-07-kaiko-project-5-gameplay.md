---
layout: post
---

<div style="height: 50px;"></div>

During my full-time employment at Kaiko, I was responsible for several gameplay features, ranging from player traversal to enemy AI. All work was done for Project 5, an unreleased title based on a well-known THQ Nordic IP. The game was developed using an Entity Component System (ECS) architecture, where entities were defined by their components, and logic was implemented through dedicated systems operating on those components. Each component stored data and configuration specific to its associated entity, which was managed with the help of proprietary tools and converters. 

Throughout the process, I collaborated closely with a number of other departments, including Game Design, Art, Animation, VFX, Rendering, and Level Design. Many features were the result of tight cross-disciplinary coordination, and I was fortunate to work alongside incredibly skilled and talented people, many of whom I will mention later in this post.

Contents of this post:
- [Wall Movement System](#wall-syst)
- [Steering System](#steer-syst) <!--<a href="#steer-syst">Steering System</a> -->
- [Interactable System](#inter-syst)
- [Carriable System](#carr-syst)
- [Quick Time Event System](#qte-syst)
- [Boss Battle](#boss-fight)

<a id="wall-syst"></a>

## Wall Movement System

This system handles both vertical and horizontal wall runs. One experimental variation allowed the player to manually switch wall run direction upon reaching designated wall run extenders, while the default behavior extended the wall run automatically in the same direction. During a wall run, if a designated wall-run target - such as a wall run extender or a horizontal rail - is detected, the movement curve dynamically adjusts to guide the player toward a predefined position relative to that target. From there, a transition animation can begin. If an extender is detected below a falling player, the system either pulls the player toward the extender to initiate a "jump-over" animation or pulls away if a valid landing cannot be predicted.

There are multiple transitions into a wall scrape state - for example, after a vertical wall run with no valid target, or when failing a corner jump during a horizontal wall run. The **horizontal rail traversal** system, also shown in the video, was another feature I contributed to, having taken over the feature from a former developer on the team.

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

<div class="video-embed">
	<iframe src="https://player.vimeo.com/video/1085447324?h=57a4ec6af9&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" width="720" height="405" frameborder="0" allow=" fullscreen; picture-in-picture" preload="none"></iframe>
</div>

<div style="height: 1px;"></div>

*Mixed wall runs with manual extenders.*

Manual extenders include an idle timeout, after which the character automatically drops. Wall-running is only permitted in directions marked with a special wall-runnable material tag, which also indicates the type of wall run (vertical or horizontal).

While the player is airborne, nearby walls are detected using raycasts and evaluated against several conditions - such as the presence of the material tag, wall orientation, and whether the wall is part of a corner. This detection system provides a list of all valid wall run directions, but the final choice still depends on the player's input.

<details>
<summary>Code example of how the nearby walls are analyzed for a potential wall run.</summary>
	{% include wall_run_code.html %}
</details>

<!-- ## Slope Slide System

System that processes sliding down a non-walkable slope. -->

<a id="steer-syst"></a> 

## Steering System

The steering system was implemented by combining the notion of [context maps](https://www.gameaipro.com/GameAIPro2/GameAIPro2_Chapter18_Context_Steering_Behavior-Driven_Steering_at_the_Macro_Scale.pdf) with <!-- the dynamic collision prediction by [Stephen J. Guy and Ioannis Karamouzas](https://www.gameaipro.com/GameAIPro2/GameAIPro2_Chapter19_Guide_to_Anticipatory_Collision_Avoidance.pdf) and --> the steering behaviors by [Craig W. Reynolds](https://www.red3d.com/cwr/steer/gdc99/). 

![Alt text](/assets/images/kaiko/systems.png) 
*System hierarchy. The NPC controller was built by [Tobias Opfermann](https://www.linkedin.com/in/tobias-opfermann-477179210/?originalSubdomain=de), ground movement system by Thomas Iwanetzki.*

In the video examples, the NPC controller sets the desired behavior - such as pursuing a dynamic target (the player), fleeing from the target (after attacking), or seeking the spawn position (when the player moves out of range).

The system uses two direction maps an interest map and a danger map. The maps are represented by arrays of weights, each entry mapped onto a direction in world space. Map entries are generated through "contributions" from various steering forces, which are visualized as yellow debug text in the videos. Contributions from attractive forces are written into the interest map, while repelling forces populate the danger map. In the end, after both maps are normalized and superimposed, the result is resolved into a single direction. To reduce jitter, a running mean is applied to smooth out directional changes.

Attracting forces include: **pursuit/pursuit with offset, seek, flee** and **flocking** behaviors. Repelling forces consist of **static collision avoidance** and **dynamic collision avoidance (e.g., player and NPC movement)**. <!--The seeking behavior uses the target position as a static one, while pursuit takes into account the current speed of the target entity and predicts the position by using a modified version --> In the videos below, entities and their resulting desired directions are visualized with circles and debug lines - red for the player (target) and blue for the NPCs. Each enemy reserves one attack slot around the player (attack scheduler feature that provides these slots developed by Tobias Opfermann), which becomes the offset for the pursuit target (pursuit with offset behavior). These target positions are marked by magenta crosses. Weighted danger directions are displayed as red lines around the enemies, while valid interest directions - after subtraction - are shown in green.

<div class="video-embed">
	<iframe src="https://player.vimeo.com/video/1085289445?h=25fce98fe4&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" width="720" height="405" frameborder="0" allow=" fullscreen; picture-in-picture" preload="none"></iframe>
</div>
*A small group of enemies, switches between pursuit, flee and seek behaviors.*

<!-- <div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/1085289445?h=25fce98fe4&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Gameplay: Enemy Steering - Small Group"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>-->

<div style="height: 30px;"></div>

<div class="video-embed">
	<iframe src="https://player.vimeo.com/video/1085290416?h=a4679863c2&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" width="720" height="405" frameborder="0" allow=" fullscreen; picture-in-picture" preload="none"></iframe>
</div>

*A larger group of enemies navigating around the static collision.*


<a id="inter-syst"></a> 

## Interactable System

This system processes interactions between (usually) pairs of entities - an interactor and an interactable - through a state machine. The state machine can be conceptually divided into the following stages:

- Positioning both entities at predefined positions (if needed)
- Playing synced animations (if available)
- Handling interaction outcomes

Each interactable entity is assigned an Interactable component. These components support an arbitrary number of defined transitions stored in setup data. A "transition" is the concrete interaction that typically switches the "multi-state" of an interactable from A to B. Each transition defines its:

- Requirements: conditions for triggering the transition (required "multi-state", angle range, interactor type, etc.)
- Body: instructions for handling the transition (e.g. option to skip certain state-machine steps, what animations to play, etc.)
- Outcome: the resulting "multi-state" or a special action (such as entering a quick-time-event.)

This structure allowed for an automatic context-based choise of the current available interaction by the system. For example, interacting with an object from behind may trigger different animations than interacting from the front. 

<div style="height: 20px;"></div>

<div class="video-embed">
	<iframe src="https://player.vimeo.com/video/1085462219?h=10cd5d3a97&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" width="720" height="405" frameborder="0" allow=" fullscreen; picture-in-picture" preload="none"></iframe>
</div>

<div style="height: 1px;"></div>

*An example of how the different closed-to-open transitions are chosen based on the interactor character and the interaction direction. The direction ranges defined for this particular chest type are visualized with red lines. The blue cross denotes the interaction position from which the animation will trigger, and can also be defined per transition. In this example - the characters will position themselves a bit further from the chest when interacting near its corner. Some models (like the instrument of the male character) are not rendered due to the NDA.*

<!-- The context in which a certain transition should be triggered is defined in the "Requirements" part of the transition's setup. Examples of that could be: interactor type (player, npc, object, etc), directoin from interactable, initial state of the interactable and so on. 

The setup for the interaction "body" can define a skip of the positioning part or cut directly to the outcome, i.e. instant interaction. The latter was especially useful for auto-triggered interactions like throwing objects that trigger other objects or stepping on platform-switches. 

The outcome setup is the most compact one, and is mainly used to exit the interaction into a specific  -->

<!-- The system also allowed to temporarily spawn additinal animated models.  -->

The system is also responsible for filtering nearby interactables and their transitions. Only one interaction and transition can be available at a time, with the exception for the auto-triggered ones (e.g. picking up an item while stepping on a platform-switch is still possible). A clear view of the filtering hierarchy made it easy to cache out the "potential interactions" to be later used for displaying contextual player-hints (such as "switch character to interact").

<details>
<summary>The code that looks for the available transition within one interactable object.</summary>
	{% include interactable_code.html %}
</details>

<div style="height: 20px;"></div>

As the result, the system was versatile enough to support a very diverse set of interactions, without the need to implement them as separate features. Examples of those include: pulling/pushing levers, triggering pressure-platform-switches by walking over them, objects that trigger other objects, initiating dialogues, executing enemies and so on.

<!--In hindsight, a separate system for processing the positioning of entities during an execution would've made more sence, as it required a very different behavior than the regular interactions did and resulted in a lot of special code to handle all the corner cases.-->

<a id="carr-syst"></a> 

## Carriable System

This system manages entering and exiting the carrying state, as well as handles specific edge cases. When the player issues a place command, the system performs a number of radial ground checks around the player,  to automatically turn them and place the object on a collision-free ground. Picking up objects and socketing them in or out are treated as interactions and are handled by the **Interactable System**.

<div class="video-embed">
	<iframe src="https://player.vimeo.com/video/1085470271?h=2e21ed7e15&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" frameborder="0" allow=" fullscreen; picture-in-picture" preload="none"></iframe>
</div>

*Sphere VFX by [Adrian Vögtle](https://exaii.artstation.com/).*

The carried object is parented to the player via the **Attachment System**, to which I contributed by implementing an attachment type that preserves the child's original orientation. I also added an interpolation feature, to smoothly align the child's orientation, facing, and position with that of the parent, with configurable parameters.

<a id="qte-syst"></a> 

## Quick Time Event System

This system registers button presses and handles both win and fail conditions. The basic QTE type increases the linear progress value with each player input and decreases it when the player is inactive. The blended progress value interpolates toward the linear one using [lerp-damping](https://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/). A QTE fails if no input is received within a specified time window. The system supports triggering visual and sound effects at defined progress or regression points. These effects are configured per the concrete QTE and are automatically triggered when their conditions are met. The example shown in the video is an **interaction** that ends in a special QTE action, and has the QTE outcome as the requirements for the transitions "pull the lever to the end" (QTE passed) or "let go" (QTE failed).

<div class="video-embed">
<iframe src="https://player.vimeo.com/video/1085459902?h=16a97251ed&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" frameborder="0" allow=" fullscreen; picture-in-picture" preload="none"></iframe>
</div>


*The yellow bar represents the linear progress, while the green bar shows the blended (smoothed) progress. A visual effect is triggered at the 20% progress threshold. Lever model by [Clemens Petri](https://miesepetri.artstation.com/), animations by [Phi Kernbach](https://hirngespinst.artstation.com/)*.

<a id="boss-fight"></a> 

## Boss Battle

During development, I took ownership of several enemy units. Adding a new enemy into the runtime involved creating and setting up its entity template, requesting any missing animations, and implementing custom logic within the enemy behavior scripts. The behavior scripting environment was provided by Tobias Opfermann. I've chosen to highlight the boss unit, due to its unique design and the high level of interdisciplinary complexity it required. In addition to the boss, the video example contains a separate feature I was responsible for - **ground surface types that apply buff/debuff status effects when walked on**.

Apart from the 2 health-stages and their attacks, the design incorporated the surroundings of the boss arena. Part of the boss battle logic that I implemented resided inside the level scripts; the level scripting environment provided by [Markus Wall](https://portfolio.rpg-hacker.de/). This battle required a temporary spawn of damaging areas, which I implemented as a standalone re-usable feature. The VFX were created by [Adrian Vögtle](https://exaii.artstation.com/) and [Alexandra Anokhina](https://pyrrhulla.xyz/), boss animations outsourced from Metricminds. Player combat system created by [Pascal Scheuber](https://pascalscheuber.wixsite.com/portfolio), whip traversal by [Manuela Schildknecht](https://schildka.github.io/).

<div class="video-embed">
<iframe src="https://player.vimeo.com/video/1086475744?h=f73bd7eed8&amp"  frameborder="0" allow=" fullscreen; picture-in-picture" preload="none"></iframe>
</div>

*The battle includes a special arena-wide attack in which the boss becomes invincible and "summons" trees that must be destroyed before the attack ends. If the player manages to do so, the boss becomess stunned, otherwise the player gets damaged by the explosion. The video shows both outcomes (failure and success), as well as a special ground surface - lava-like terrain around the arena - that applies a status effect to the player.*



<!--
```
float exp = 2.718281828459f;
float lerpTarget = 1.0f - keen::pf::pow(exp, -1.0f * QuickTimeEventSystem::s_quickTimeEventBlendDamp * timeStep);
float blendedProgress = keen::lerp(blendedProgress, linearProgress, lerpTarget); 
```

*Blended progress uses frame-rate independend damping.*-->