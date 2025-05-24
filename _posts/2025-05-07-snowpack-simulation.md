---
layout: post
---

<div style="height: 50px;"></div>

This project simulates snowpack compression on the GPU within the Unity Engine. A demo of the project is available under [this link](https://github.com/kamilashi/Snow-Simulation/tree/main/Build) -> Snow SImulation.exe. The GPU source code can be found in the Snow-Simulation/Assets/Shaders folder - files with the .compute and .shader extensions. This page focuses on the core concept behind the project and the design of the systems.

<div style="height: 20px;"></div>

The snowpack is represented by a voxelized grid using an Eulerian flow description. Each cell stores a set of physical properties such as density, hardness, temperature, mass, and applied pressure. Snow compression is simulated in multiple stages within a compute shader. Each cell follows the following lifecycle:

1. Calculate total **pressure** acting on the cell (sum of the snowpack's weight above it and any external pressure).
2. Calculate **hardness** based on the cell's current density and temperature.
3. Calculate **stiffness** (spring coefficient), derived from the cell's density.
4. Calculate compression **indent**, using the total pressure, hardness, and stiffness.
5. Calculate a temporary **density candidate** based on the indent amount.

In step 6, the simulation resamples all cells using the temporary density values, eliminating "half-empty" cells except at the top of each column. The final result defines the updated height of each column, which is used to update the height-plane representing the snowpack's visible surface. This cycle continues each frame until the snowpack stabilizes and reaches a steady state.

![Alt text](/assets/images/snowsim/compresionIllu1.png)
*Result of steps 1-5: new density candidate and the cell indent*

![Alt text](/assets/images/snowsim/densityResamplingIllu.png)
*Step 6: column density resampling -> final density of the cycle*

<div style="height: 20px;"></div>


![Alt text](/assets/images/snowsim/classDiagram.png)
*Class diagram*

<div style="height: 20px;"></div>

The external pressure is introduced through objects referred to as snow colliders, which are defined by their mass and volume. The pressure they apply is calculated based on the area of the snow surface they intersect.

<div style="height: 20px;"></div>

![Alt text](/assets/images/snowsim/colliders.png) 
*Sources of the external pressure (snow colliders) on the snow surface.*

<div style="height: 20px;"></div>

Colliders in this example:

|		    | mass (kg)     | collision area (m^2) |
|:----------|:-------------:|:--------------------:|
| Collider 1|		100     |			16		   |
| Collider 2|		100		|			1		   |
| Collider 3|		100		|			0.1		   |

<div style="height: 20px;"></div>


For a snowpack with a height of 5.8 meters, a uniform density of 20 kg/m³, and a temperature of -3 °C, the initial total pressure is as follows:

![Alt text](/assets/images/snowsim/vis_start_pressure.png) 
*Pressure that exceeds the cell's hardness (enough for the snow to compress) is rendered into the green channell.*

<div style="height: 20px;"></div>

<div class="image-grid" >
	<div class="item" >
		<img src="/assets/images/snowsim/test1_start.png" alt="Image 1" >
		<p >(a)</p >
	</div >
		<div class="item" >
		<img src="/assets/images/snowsim/test1_halfway.png" alt="Image 2" >
		<p >(b)</p >
	</div >
		<div class="item" >
		<img src="/assets/images/snowsim/test1_stable_side.png" alt="Image 3" >
		<p >(c)</p >
	</div >
		<div class="item" >
		<img src="/assets/images/snowsim/test1_stable_density.png" alt="Image 4" >
		<p >(d)</p >
	</div >
</div >

*Visualization of simulation run for test 1.a. Screenshots show the pressure profile (green) mixed with the current temperature of -3 °C (red). C at simulation time = 0 s (a), 30 s (b) and approx. 2 minutes (c). Sub-figure (d) shows the stable-state density gradient.*




