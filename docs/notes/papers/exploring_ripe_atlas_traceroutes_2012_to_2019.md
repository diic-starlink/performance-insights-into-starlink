# Exploring RIPE Atlas Traceroutes from 2012 to 2019

See [RIPE Atlas Blog].

## Introduction

- RIPE Atlas does a traceroute measurement every 30 min.
- Traceroute is Paris traceroute
- Researchers used Cousteau and Sagan frameworks to fetch RIPE Atlas Data
- put together a collection of traceroute data for up to 10'000 probes

## Target

- Build graph from all probes to target servers
- Graph will include the nodes from the tracerouting
- Graphs could be calculated efficiently on single laptop
- Data is cleaned by removing addresses in the [RFC1918] ranges

## Results

- Some servers have higher success rates than others
    - 5015 and 5016 have severely lower success rates
    - others varied between ~ 70 - 95 %

[RIPE Atlas Blog]: https://labs.ripe.net/author/nevil/exploring-ripe-atlas-traceroutes-from-2012-to-2019/
[Cousteau]: https://pypi.org/project/ripe.atlas.cousteau/
[Sagan]: https://pypi.org/project/ripe.atlas.sagan/
[RFC1918]: https://datatracker.ietf.org/doc/html/rfc1918
