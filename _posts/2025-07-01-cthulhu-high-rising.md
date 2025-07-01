---
layout: post
---

<div style="height: 50px;"></div>

This small Lovecraftian-themed tower defense game with card mechanics was originally conceived during a one-week game jam. I was responsible for the initial project setup and programming the building phase of the core game loop, which included: 

- Card draw and play mechanics
- Custom block behaviors
- Property modifiers 

## Card Gameplay

The current version of the game loop consists of two alternating phases: building and combat. During the building phase, players construct, equip, and upgrade a block-based tower using three card types: block, equipment and modifier cards. 
The gameplay objective is to build the tallest possible tower while defending its core (a statue at the top) from waves of enemies.

<!-- Most of the game's features provide an interface that is friendly for non-coders to tweak and balance some values - those are stored as assets (Scriptable Objects) and are referenced by the runtime. -->

## Modifiers

Modifiers were designed to be used with both blocks and equipment. Each modifier is defined as an operation-operand pair applied to a ModifiableProperty. The ModifiableProperty class stores a base value (float or int) and a list of active modifiers. When queried, it computes the final result by applying all modifiers and caches the outcome until the modifier list changes. At the moment, modifiers can affect the damage, speed and range properties of equipment objects.

<div style="height: 20px;"></div>

<div class="video-embed">
	<iframe src="https://player.vimeo.com/video/1097892540?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" width="720" height="405" frameborder="0" allow=" fullscreen; picture-in-picture" allowfullscreen></iframe> 
</div>

<div style="height: 1px;"></div>

*Gameplay of the building phase, followed by the combat phase. The game is lost as soon as an enemy reaches the core at the top.*

## Block Types

Blocks are defined by their unique gameplay features, like slowing down entities that pass through or dealing damage over time. Each block has a pre-defined number of free slots that can be filled with equipment during the building phase.

<div style="height: 20px;"></div>

<div class="video-embed">
	<iframe src="https://player.vimeo.com/video/1097889727?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"  width="720" height="405" frameborder="0" allow=" fullscreen; picture-in-picture" allowfullscreen ></iframe> 
</div>

<div style="height: 1px;"></div>

*Default block with the largest number of free slots, the slow-down block with fewer slots and the damage-over-time block with no available slots.*


## The Origin

The game-jam team consisted of seven members:

- Adrian Vögtle (Idea Pitch, VFX & Tech Art, Camera Controls)
- Clemens Petri (Block Models, Card Materials)
- Stella Behrendt (2D Art, Card Textures)
- Gerald Krison (Game Design)
- Niklas Büdel (Canon and enemy logic, UI)
- Manuela Schildknecht (Game loop, UI)
- and myself.

This was a fun collaboration among talented and passionate people - an experience that not only created lasting memories, but also sparked ideas we're still excited to explore beyond the original jam.