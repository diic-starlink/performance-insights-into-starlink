#
# Usage:
#   nix-shell --run "runAll"
#

let
  pkgs = import ../../nixpkgs {};
in pkgs.mkShell {
  pname = "runProducers";
  version = "0.0.1";

  buildInputs = with pkgs; [
    docker-compose
    nodejs_22
    tmux
  ];

  shellHook = ''
    runDockerCompose() {
      tmux new-session -d -s dbbackend -c db-controller 'docker-compose up --build'
    }

    runProducers() {
      cd ./producers
      ./startall.sh
    }

    runAll() {
      runDockerCompose
      sleep 5 # Wait for the backend to start
      runProducers
    }
  '';
}

