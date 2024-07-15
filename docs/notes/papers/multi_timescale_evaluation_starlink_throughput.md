# Multi-Timescale Evaluation of Starlink Throughput

See [Paper](../papers/multi_timescale_evaluation_starlink_throughput.md)

## Abstract

- Network layer measurement campaign
- Claim to have found the 15s reconfiguration interval
    - because of beam switching
- in the end, link utilization is only at about 46% of the estimated link capacity

## Diurnal Variations

- strong diurnal (i.e., variation over the day) variation
- strong throughput in the night
- maximum throughput at around 5am (UTC+2)

## Fine-Grained Measurements

- Measurements with precision at ms level
- Observation of a sudden drop after 7.18s
    - slow, but not complete recovery afterward
- visible in many run
- authors clustered the runs and each cluster show the same drop at around 7.2s

## 15s Throughput Anomaly

- in coarse-grained measurements, a drop of throughput is observed every ~15s
- "the underlying Starlink process generate the 15s drops"
- Authors correlate this finding to another paper that claims beam switching at 15.5s
- Therefore, the authors say it is due to beam switching

- However, in a single connection, the 15s drops cannot be reproduced reliably
    - that might be due to underutilization of the bandwidth with a single connection only


