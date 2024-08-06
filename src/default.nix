let
  pkgs = import ../nixpkgs {};
in pkgs.mkShell {
  pname = "runProducers";
  version = "0.0.1";

  buildInputs = with pkgs; [
    docker-compose
    nodejs_22
  ];

  shellHook = ''
    runBackend() {
      tmux new-session -d -s dbbackend -c $(pwd)/db-controller
      tmux send 'newgrp docker' ENTER # For some reason this is required
      tmux send 'docker-compose up --build' ENTER
    }

    runProducers() {
      cd ./producers
      ./startall.sh
      cd ..
    }

    runAll() {
      runBackend
      sleep 30 # Wait for the backend to start
      runProducers
    }

    killProducers() {
      tmux kill-session -t producers
    }

    killBackend() {
      tmux send-keys -t dbbackend C-c
      # It takes up to 10.2s for Docker to shut down their containers.
      sleep 15
      tmux kill-session -t dbbackend
    }

    killAll() {
      killProducers
      killBackend
    }

    help() {
      echo ""
      echo "🚀 Welcome to the producers shell 🚀"
      echo ""
      echo "Be aware, you need to be in the /src dir of the repository outside a tmux session."
      echo "Following commands are available:"
      echo "   - runBackend: Start the backend services in the 'dbbackend' tmux session."
      echo "   - runProducers: Start the producers in the 'producers' directory."
      echo "   - runAll: Execute the previously two mentioned commands with a sleep of 30s in between."
      echo "   - killAll: Kill 'dbbackend' and 'producers' tmux sessions."
      echo "   - killBackend: Cancels processes and kills 'dbbackend' tmux session."
      echo "   - killProducers: Kills 'producers' tmux session."
      echo "   - help: Display this help message."
    }

    if [ "$TERM_PROGRAM" = "tmux" ]; then
      echo "Cannot run tmux scripts in tmux session."
      echo "Exiting ..."
      exit
    else
      curr_dir=$(basename $(pwd))
      if [ ! "$curr_dir" = "src" ]; then
        cd src
      fi
      help
    fi
  '';
}

