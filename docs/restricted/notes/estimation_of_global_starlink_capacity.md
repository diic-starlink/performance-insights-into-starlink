# Estimation of the Starlink Global Satellite System Capacity

See [Paper](../papers/estimation_of_starlink_global_satellite_system_capacity.pdf).

- Starlink's system is mostly limited due to their system capacity
- System capacity is determined by:
    - number of satellites
    - spectral efficiency ⇾ limited to 4.5 bits/Hz

### What is Spectral Efficiency?

- spectral efficiency is the rate between information rate and given bandwidth
    - e.g., if a dish can transmit with 1000 Bit/s and use the frequencies from 100 to 1000 Hz, then the spectral efficiency is calculated by 1000Bit/s / (1000Hz - 100Hz) = 10/9 (Bit/s)/Hz
- measured in Bit/s/Hz
- Starlink uses Ka- and Ku-band transmitters
    - Ka-band: 26.5 to 40 GHz
    - Ku-band: 12 to 18 GHz

## About Starlink

- 11'943 satellites planned for finished constellation
    - 7'518 satellites in lower orbits (335 to 346 km)
    - **Problem: Source for those claims are missing**
- altitudes spanning from 550 to 1'100 km
- Idea: Build all devices in peer-to-peer fashion
    - each device serves as independent part of the network
    - each device can serve as client and server
    → but ISPs are not there for every satellite
- each satellite operating at approximately 20 Gbit/s

## System Capacity

- System Capacity describes the maximum information transfer rate in the system
    - see Shannon Theorem in "Error-Correction Coding" (Parker et al.) -- already in JabRef
- overall, system capacity is dependent on two main variables:
    - number of satellites
    - used frequency
- the more satellites, the better
- you do not want to use a frequency in the range of approximately 50 to 70 GHz as this reduces the capacity by a lot
    - in the experimental calculation the worst capacity was around 79.5 Tbps (at approximately 61 GHz), while the optimum was around 88.5 TBps (all frequencies outside [50, 70] GHz).

## Learnings

- Starlink can provide up to 90 Tbps, which is not nearly sufficient to feed the whole world
- According to [here](https://www2.telegeography.com/hubfs/assets/product-tear-sheets/product-page-content-samples/global-internet-geography/telegeography-global-internet-geography-executive-summary.pdf), the total bandwidth in 2023 was at around 1'200 Tbps, which exceeds the Starlink capacity by a lot, even when looking at average utilization
