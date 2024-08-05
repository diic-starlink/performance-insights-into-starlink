# How is Starlink Manoeuvering?

See [Paper](../../papers/how_is_starlink_manoeuvring.pdf).

- Analysis of Starlink's manoeuvering behavior
- Uses TLE data from Space-Track

## Starlink's Manoeuvering

- Starlink is organized in 7 different shells (named by their numbers 1 through 7)
	- each shell has an altitude of 500 - 600 km
	- shell 1 and 4 are the largest ones
	- smaller launch batches usually go into the same shell
- Starlink satellites are launched into a lower orbit and then raise their altitude
	- observation of high number of maneuvers immediately after launch

## Starlink Orbit Keeping Measures

- in LEO, satellites do not keep their altitude by themselves
	- influenced by atmospheric drag, solar radiation pressure, and non-spherical nature of the earth
	- therefore, the need to perform maneuvers in order to keep their altitude
- Starlink performs such altitude-keeping maneuvers approximately every 80-days
	- Starlink prefers performing these maneuvers equally spread over the whole constellation
	- satellites perform the maneuvers sequentially
	- "Presumably, manoeuvring might interrupt the transmission of the satellites and SpaceX would therefore want as even a distribution of manoeuvring activity across time as possible."

## Collision Avoidance

- Starlink performs collision avoidance maneuvers
	- in shells with more satellites, more maneuvers are performed (absolute numbers! author does not say smth about relative numbers)
- the number of maneuvers in 2023 is lower than in 2022
- however, the number changes over time

- Overall, satellites have to maneuver in the following way:
	- when a satellite is launched, it maneuvers to its final orbit (requires a lot of maneuvers)
	- satellites perform regular altitude-keeping maneuvers
		- period depends on the altitude (in case of Starlink: ~80 days)
	- satellites perform collision avoidance maneuvers
		- the more satellites in a shell, the more maneuvers are performed
