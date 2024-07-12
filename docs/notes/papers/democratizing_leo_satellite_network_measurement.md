# Democratizing LEO Satellite Network Measurement

See [Paper](../papers/democratizing_leo_satellite_network_measurement.pdf).

## Goals

- Apply HitchHiking methodology to conduct pattern in LEO satellite networks in order to identify patterns
- HitchHiking works like this:
    1. Find measureable endpoints
    2. Identify where in the routing the stellite is used
    3. Measure the satellite link (i.e., 'hitchhike')

## Devalidation of prior Assumptions

Following assumptions are wrong:

- 1: Starlink's peaks of latency are not due to satellite location
- 2: Customer latency is bounded by the availability of a nearby Point of Presence (PoPs)
- 3: ISLs reduce latency.

## HitchHiking Methodology

1. Collect Exposed Services in the Starlink IPv4 Range
    - uses Censys database
2. Find services from Starlink devices
    - They find ~4'500 exposed services
    - Of those, 1'790 are customer endpoints
3. Filter out PePs
    - 1'629 remain
4. Find GEO location of service
5. Find the last hop that is visible BEFORE the satellite
    - usage of perspective, where the first hop comes from a PC and the last hop is towards the exposed Starlink service
6. Find the first visible post-satellite hop
7. Measure path latency
8. Isolate Satellite Link Latency
    - take total latency
    - subtract the terrestrial service router RTT
9. Some smoothing filtering

## Outcome

- HitchHiking best solution to find real-world latencies

