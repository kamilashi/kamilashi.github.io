---
layout: post
---

<div style="height: 50px;"></div>

Sub-Action is a small Unity prototype that started as a technical test task and grew into a playground for AI-driven creature behavior. I used Unity's scripting flexibility to keep creature logic highly customizable while still avoiding "special case" code bloat. Most of the systems are common for all creatures (player and enemies), with only two **customization points**: 

- a **controller** script 
- and a set of **action/attack** scripts. 

The controller acts as the "brain" and the local scheduler that decides which action to run and when. Actions themselves live in a generic action hub component that is common to all creature types. The hub is reusable, while the contents of individual actions are entirely custom, implemented as **coroutines**, which gives a good balance between flexibility and maintainability. The **snake/centipede** enemy became the main showcase, with its motion fully driven by code, together with a flock of **boid-like agents** and a small **steering plus target selection** system to tie everything together. There is also minimal gameplay seasoning like player controls, camera shake on player damage and collectibles. The source code as well as the build is available [here](https://github.com/kamilashi/Sub-Action).

## Spring-like Motion

The snake is built as a chain of segments that follow each other using a custom **Verlet** style simulation. The "head" segment decides whether to chase an interesting target from the steering system or wander on its own, then either steers toward the chosen position with a charge action or roams between random points in a ring around its origin. Each following segment remembers its previous position, blends a rigid follow direction with an elastic direction based on its velocity, as well as interpolates between a tight and loose segment length - all with configurable parameters.

The result looks like a physically plausible creature without running a full physics simulation on every joint. The parameters control how wobbly or tight the body feels, so I can quickly tune it from "loose and squishy" to "fast and precise". The same parameters are being set in the individual custom action coroutines - e.g. tighten during attack anticipation, elongate during bite and slowly ralax during the cooldown. 

<div class="video-embed">
	<iframe src="https://player.vimeo.com/video/1140411851?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" frameborder="0" allow=" fullscreen; picture-in-picture" preload="none"></iframe> 
</div>
*Snake's spring-like movement during attack and chase actions.*

## Boids-style Flocking

Alongside the snake I implemented a simple boids flocking system to demonstrate how the action hub can drive groups of agents. Each boid evaluates a combination of classic steering rules such as separation, alignment, and cohesion, with a sprinkle of artistic freedom that plays into the believability of the movement. Then, it feeds the resulting direction into its current movement action. A video demonstration is available at the end of the post.

## Steering And Target Selection

The steering and target selection system turns raw sensor data into a single meaningful direction. Each enemy keeps a list of nearby creatures and classifies them by **rank** into 
Consists of layers:

 - higher rank **dangers**
 - lower rank "food" or **interests**
 - same-rank neighbors for **flocking**
 
 Steering then runs a small scoring pass where potential directions are clustered by angle (using k-means) and evaluated by a simple rank over distance formula, so the agent thinks in terms of "go toward this cluster of weak targets" or "avoid this cluster of stronger threats" rather than reacting to every single entity one by one. A fear parameter controls how strongly danger influences the final choice, which lets the same code produce both aggressive chasers and skittish runners by just tweaking values. Once the best direction is found the system picks the closest transform in that direction as the current target and exposes a single steering vector that can be combined with boids style separation, alignment, and cohesion, so high level AI can stay focused on "what I want" while low level steering takes care of "how I move there."

<div class="video-embed">
	<iframe src="https://player.vimeo.com/video/1140409015?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" frameborder="0" allow=" fullscreen; picture-in-picture" preload="none"></iframe> 
</div>

*The video demonstrates the snake chasing the flock of boids, then going into its "idle mode" when no prey is around and then picking up on the chasing once it senses the boids.*

