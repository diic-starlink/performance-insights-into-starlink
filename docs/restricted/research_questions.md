# Research Questions

- Comparison of LEO, GEO and Wired Internet Technology

- How high is the packet loss?
	- Measure in percent
	- Use Ping Measurement on RIPE
	- Previous papers reported in high packet loss in Starlink
- How does the routing look like in Starlink?
	- Can we make assumptions about the enablement of ISLs?
	- look at the Starlink Firmware (at least what is out there)
- Are there regional differences with LEO?
- How does Starlink latency change with different protocols?
	- kinda hard to estimate due to missing probes

- Do ISLs improve latency?
	- Idea for Starlink constellation is that it does
		- "each satellite serves as individual unit" -> see [estimation of starlink capcity](./papers/estimation_of_starlink_global_satellite_system_capacity.pdf).
	- [Mohan et al.](./papers/a_multifaceted_look_at_starlink_performance.pdf) say ISLs enhance network performance
	- [Hauri et al.](./papers/internet_from_space.pdf) also claim ISL to be important
	- BUT [Iyhikevich et al.] say it increases number of hops and therefore also latency in real-world application
	⇒ So what do ISLs actually do to latency?

