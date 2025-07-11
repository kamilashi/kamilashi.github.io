---
layout: post
---

<div style="height: 50px;"></div>

A Java-based prototype demonstrating distributed communication through message-oriented middleware. The system simulates a robot exploring an indoor environment, generating the map data and sending updates in real time via an Apache ActiveMQ message queue (JMS). A separate client application consumes these updates and visualizes them through a dynamic GUI. The mock-up design of the client interface was created in Figma, illustrating the intended user experience and UI flow. This project was developed as part of a university assignment in a Software Engineering course.

<div style="height: 20px;"></div>

<div class="single-video" >
	<video autoplay muted loop >
		<source src="/assets/videos/javarobot_figma_f.mp4?v=4" type="video/mp4">
		Could not load the video
	</video >
</div>

![Alt text](/assets/images/javarobot/clientapp.png)
*Client app screens showcasing the three map-authoring modes that were required for the task.*

The source code is available over at [this link](https://github.com/kamilashi/Steve-The-Cleaner).

<div style="height: 20px;"></div>

<div class="video-embed">
	<iframe src="https://player.vimeo.com/video/1100734044?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" width="720" height="405" frameborder="0" allow=" fullscreen; picture-in-picture" allowfullscreen></iframe> 
</div>

<div style="height: 1px;"></div>

*Demo footage of the client and the robot apps communicating over the network, being launched from the BlueJ IDE.*



