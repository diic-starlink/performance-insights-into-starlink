#!/bin/bash

# Works best without nested tmux sessions
if [ "$TERM_PROGRAM" = "tmux" ]; then
	echo "Cannot run tmux scripts in tmux session."
	echo "Exiting ..."
	exit
fi

# Start a new TMUX Session
tmux new-session -d -s dhc_to_delab_tunnel

# Build a tunnel from DHC to local computer
tmux send 'ssh dhc-vm -N -L 5432:localhost:5432' ENTER

tmux split-window -h
# Build a reverse tunnel from local computer to DELab
tmux send 'ssh tx02 -N -R 5432:localhost:5432' ENTER

tmux split-window -v
# Make Jupyter available on local machine
tmux send 'ssh tx02 -N -L 8888:localhost:8888' ENTER

tmux a -t dhc_to_delab_tunnel
