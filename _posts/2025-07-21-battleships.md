---
layout: post
---

<div style="height: 50px;"></div>

A minimal multiplayer implementation of Battleships using the Mirror networking library, with KCP transport for local connections and Fizzy Steamworks for remote matchmaking via Steam. You can view the source code [here](https://github.com/kamilashi/Battleships) and try the latest build [here](https://github.com/kamilashi/Battleships_Build). 

During the building phase, each player sets up their map locally, which is then synchronized with the server. From that point on, all combat logic is handled server-side. At the end of each turn, the server sends the outcome back to both clients, who then visualize the results - such as hits, misses, exposed cells, and damaged ships - based on the provided data (e.g., cell coordinates and hit results). 

The water and cell shaders were custom-built for this demo. The rock models were taken from a free Sketchfab [resource](https://sketchfab.com/3d-models/free-pack-rocks-stylized-7c60b4d1b8ab4187965f30c5e0212fc0).

Below is a demonstration of a local multiplayer session running on two separate machines.

<div style="height: 20px;"></div>

<div class="single-video" >
	<video autoplay muted loop >
		<source src="/assets/videos/battleships_local_host_f.mp4?v=2" type="video/mp4">
		Could not load the video
	</video >
</div>
<div class="single-video" >
	<video autoplay muted loop >
		<source src="/assets/videos/battleships_local_client_f.mp4?v=2" type="video/mp4">
		Could not load the video
	</video >
</div>
*Local gameplay.*


<div style="height: 20px;"></div>

You can also play remotely using Steam invites.

<div class="single-video" >
	<video autoplay muted loop >
		<source src="/assets/videos/battleships_spacer_f.mp4?v=1" type="video/mp4">
		Could not load the video
	</video >
</div>

<div style="height: 1px;"></div>

*Host (left) and client (right).*



