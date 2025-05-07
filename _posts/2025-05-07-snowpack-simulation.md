---
layout: post
---

<div style="height: 50px;"></div>

Snowpack compression simulation done on the GPU inside the Unity Engine. The snowpack is represented by a voxelized grid, each cell storing its properties, such as density, hardness, temperature, mass, applied pressure, etc. Snow compression is calculated in several steps inside a compute shader. Each cell's lifecycle looks like this:

1. Calculate the total pressure acting on the cell (weight of the snowpack above + extenral pressure)
2. Calculate the cell hardness based on its density and temperature
3. Calculate the cell stiffness (spring coefficient) based on its density
4. Calculate the compression indent based on the total pressure, hardness and stiffness
5. Calculate the new temporary cell density candidate based on the cell indent amount

The final step 6 takes the temporary density and resamples all the cells to get rid of "half-empty" cells except for the top-most ones. The result produces the final height of the column which then feeds into a plane that represents the surface of the snowpack. Then the cycle repeates.

![Alt text](/assets/images/snowsim/compresionIllu1.png)
*Result of steps 1-5: new density candidate and the cell indent*

![Alt text](/assets/images/snowsim/densityResamplingIllu.png)
*Step 6: column density resampling -> final density of the cycle*

<div style="height: 20px;"></div>


![Alt text](/assets/images/snowsim/classDiagram.png)
*Class diagram*

<div style="height: 20px;"></div>


The external pressure is taken from test objects, called "snow colliders" with a defined mass and is calculated from the snow surface area that they collide with. 

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


For a snowpack of 5.8m in height and a uniform density of 20 kg/m^3 and temperature of -3 deg. C., the initial total pressure looks like this:

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

*Visualization of simulation run for test 1.a. Screenshots show the pressure profile mixed with the current temperature of -3 deg. C at simulation time = 0 s (a), 30 s (b) and approx. 2 minutes (c). Sub-figure (d) shows the stable-state density gradient.*




