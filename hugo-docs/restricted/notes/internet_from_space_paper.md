# "Internet From Space" without Inter-satellite Links?

See [Paper](../papers/internet_from_space.pdf)

- ISLs should be commonly integrated in Starlink
- However, no real proof of that.
	- in 2020, devices for ISLs were removed from satellites
	- How is the state now?

## Bent-Pipe and ISLs

- routing can theoretically involve ISLs or not
- if routing does not involve ISLs, it transmits data back and forth between ground-stations and satellites
	- that is called "bent-pipe"
- routing can also involve ISLs, which allows transmission between satellites without any ground stations in-between

## Results

- Paper found that ISLs offer an improvement compared to bent-pipe routing
- Paper measures absolute RTT of 5000 city pairs in intervals of 15 min
	- RTT for ISL were more stable and better
	- More stable, less RTT with ISLs
