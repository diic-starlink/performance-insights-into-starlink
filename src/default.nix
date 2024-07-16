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
  '';
}

