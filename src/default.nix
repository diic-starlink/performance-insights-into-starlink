#
# Usage:
#   nix-shell --run "runAll"
#

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
    runDockerCompose() {
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
      runDockerCompose
      sleep 30 # Wait for the backend to start
      runProducers
    }

    help() {
      echo ""
      echo "Welcome to the producers shell 🚀 !"
      echo ""
      echo "Following commands are available:"
      echo "   - runDockerCompose: Start the backend services in the 'dbbackend' tmux session."
      echo "   - runProducers: Start the producers in the 'producers' directory."
      echo "   - runAll: Execute the previously two mentioned commands with a sleep of 30s in between."
      echo "   - help: Display this help message."
    }

    help
  '';
}

