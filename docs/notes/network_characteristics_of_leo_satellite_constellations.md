# Network Characteristics of LEO Satellite Constellations: A Starlink-Based Meassurement from End Users

See [Paper](../papers/Network_Characteristics_of_LEO_Satellite_Constellations_A_Starlink-Based_Measurement_from_End_Users.pdf) (May 2023)

Keywords: Movement, Environment, LEO, Performance, Comparison LEO vs Terrestrial, TCP vs UDP, Power Consumption, Bent-Pipe

Target: Characterize Starlink network using dishes ("from the end users perspective")

- LEO satellite constellations might be an opportunity to achieve full-globe internet coverage
- Starlink users experience much more variation in network stability compared to terrestrial internet connectivity
    - However, that is expected (not really a fair comparison)
- Starlink performance is highly dependent on environmental factors like terrain, solar storm, rain, cloud, and temperature
    - also the power consumption

- Movement influences the stability of the performance significantly

## Dishes

- Starlink has two dish generations (1 and 2)
- Gen 1 is very similar in terms of hardware
- Gen 1 is round, while Gen 2 is a rectangle
- Gen 2 a little more stable in regards to TCP, while Gen 1 is more stable in regards to UDP

## Performance

- Around 10% worse Starlink performance compared to terrestrial networks
    - but Starlink is MUCH more instable (variation is 3.8 times higher than the terrestrial variation)
    - AUTHOR ASSUMPTION: Likely due to constantly changing network paths

## Routing

- Starlink uses a one-hop-bent-pipe strategy
- A satellite always connects to the closest GS no matter where it is
- the one-hop-bent-pipe architecture does not participate in the routing strategy
    - this might influence the routing badly
- dish-to-dish communication works bad
    - in paper, test via a proxy to forward traffic from dish to dish (no port forwarding allowed in Starlink router, the authors said)
    - very high latency and seriously bad throughput

## Environmental Factors

- Starlink users need a clear sky and clean dish to have acceptable performance
- Geo- and Solarmagnetic Storms influence the Starlink performance significantly
    - But not up- and download performance similarly influenced
    - OWN ASSUMPTION: Could also be due to maintenance (?)
- During rain Ka- and Ku-band suffer ⇾ worse performance
- Drop of 5-26% in performance in degrees less than 12 degrees Celsius
- Urban cities have better performance compared to the land
    - likely due to the existence of PoPs

## Stability of Bent-Pipes

- outage events correlate with the stability of the bent-pipe
    - and bent-pipe is highly instable
- in the same service area, users may experience different performances (due to obstruction e.g.)



