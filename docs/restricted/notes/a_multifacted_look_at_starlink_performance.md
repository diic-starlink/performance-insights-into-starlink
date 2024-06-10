# A Multifaceted Look at Starlink Performance

See paper [here](../papers/a_multifaceted_look_at_starlink_performance.pdf).

- Starlink's performance is competitive compared to terrestrial cellular networks
    - However, performance is not stable across the globe due to the lack of infrastructure
	- Also, performance depends on closeness of ground stations of Points-of-Presence (PoPs)
	- Stalink does not perform well under high load because of bufferbloating
- They find evidence for ISL giving superior performance compared to Bent-Pipes when connecting remote regions
- They confirm the 15s reconfiguration interval of Starlink
    - this is globally consistent

## Methodology

- usage of M-Lab
    - M-Lab allows to perform measurements from own device to many remote servers all over the world
	- good, if devices are owned
	- M-Lab measures up- and downlink performance using a single 10s WebSocket TPC connection
	    - also records goodput, rtt, and losses
- usage of RIPE ATLAS
- measurement of per-hop-latencies over a course of ten months
    - total of ~1.8M measurements samples

## Limitations

- sub-second visibility of measurements in RIPE ATLAS is bad
	- therefore, they used two dishes to record measurements themselves
- irtt (Isochronous Round-Trip-Tester) for testing rtt at high resolution (3ms interval)
- iperf for uplink and downlink performance (at 100ms intervals)

## Results

### Global View

- For majority of countries, terrestrial ISP perform better than Starlink
- Developed countries achieve better performance with terrestrial services, underdeveloped countries fare better with Starlink (e.g., Columbia)
	- not static across all underdeveloped countries
	- Philippines show bad performance
	- authors state that the distribution of ground stations and PoPs might be a reason
	- therefore, Starlink latency is correlated to the availability of GSs
	- Philippines usually have to use Japanese PoPs.
		- therefore, high latency

### Down- and Upload

- rates of up to 250 Mbps for Download
	- usually ~ 50 - 100 Mbps download
- rates of up to 25 Mbps for Upload
	- usually ~ 4 - 12 Mbps upload
- no correlation between upload / download goodput and latency


## Takeaways

- they were able to more or less confirm the 15s reconfiguration interval
	 - see plots, very good to include
	 - visible change in latency and throughput in 15s reconfiguration interval
	 - overall, handing over between satellites is NOT the cause of this, but the reallocation of resources for the connections once in every reconfiguration interval
- Starrlink is competitive to terrestrial ISPs in regions with dense GSes and PoPs
	- however, Starlink is affected by high bufferbloat

