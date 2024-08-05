# Dissecting the Performance of Satellite Network Operators

See [Paper](../../papers/dissecting_the_performance_of_satellite_network_operators.pdf).

- Target: Evaluate Performance of SNOs (especially LEO SNOs)
- Looking at Starlink, HughesNet, and ViaSat

## Methodology

- usage of public datasets from M-Lab and RIPE Atlas
- recruit SNO testers from crowdsourcing projects
  → 20 testers recruited to install browser extension

- from M-Lab, they identify data sources with
    - 11.92M TCP-based speedtests
    - 6M traceroute measurements

## Findings

- LEO has better throughput and latency
- But LEO suffers from much higher jitter variation
    - variation is relative to total latency
    - therefore, GEO has higher absolute variation, but lower relative variation
    - similar result when comparing MEO with GEO

- Customers in the Philippines are associated with a PoP in Tokyo
    - we expect better latency when adding a PoP close to the customer
    - therefore, adding a PoP in the Philippines would improve latency

- Starlink is three times faster than OneWeb

