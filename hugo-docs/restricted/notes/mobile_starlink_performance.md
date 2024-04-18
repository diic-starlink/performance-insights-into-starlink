# Starlink on the Road: A First Look at Mobile Starlink Performance in Central Europe

See [Paper](../papers/starlink_on_the_road.pdf)

## Overall Conclusions

- Starlink has devices for in-motion usage (previously, only for stationary usage)
- Setup: Take a car that is in motion and measure network parameters
	- Throughput, RTT, packet loss, power consumption

⇒ Mobile Performance is much worse than Stationary Performance
	- throughput drops by 10% when moving
	- however, being faster or slower does not influence the throughput

## Satellite Behavior Simulators

- Hypatia ⇒ requires Python only (and some Linux packages, but should work with VM)
- Starperf ⇒ requires Matlab ⇾ therefore, no option

## Starlink Setup

- Antenna + Satellite + Ground Station (GS)
- Link from these three is called "one-hope bent-pipe"
	- multi-hop bent-pipe if no GS is in reach
