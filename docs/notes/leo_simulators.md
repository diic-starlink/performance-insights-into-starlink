# LEO Simulators

How can we simulate a LEO satellite network? Currently, there are some tools out there.

Here are some of them:

- [Starperf](https://github.com/SpaceNetLab/StarPerf_Simulator)
	- requires Matlab, AGI Systems Toolkit (free trial is sufficient ...), and some more
	- this is hard-to-setup
	- therefore, don't test this
- [Hypatia](https://github.com/snkas/hypatia)
	- requires Python only
	- however, very limited in their capabilities
	- requires the information about satellites, ground stations, ISPs, ...
	- Information is not easily available.
	- Also does not take into effect that entities can move / not be available for a while.

- Overall ... not much out there
- Problem:
	- the limitations of LEO satellite systems are usually on the physical layer (e.g., Doppler effect, weather, satellite handover, solar interference, ...)
	- these are hard to simulate
	- also, recent research pointed out that network balancing within a constellation might play a crucial role
	- we do not know how this is done as it is proprietary information → we cannot expect realistic results from simulators
	- we would require a simulator simulating the earth's environment itself, but that is not feasible
