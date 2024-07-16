#!/bin/bash

# OONI not yet included.
declare -a producers=( 'cloudflare-radar' 'ripe-atlas' 'satellite-constellations' )

processes=0
for prod in ${producers[@]}; do
	if [ $processes -eq 0 ]; then
		tmux new-session -d -s producers -c $(pwd)/${prod}
	else
		tmux split-window -h -c $(pwd)/${prod}
	fi

	tmux send 'npm install && npm run start' ENTER
	processes=$((processes+1))
done
