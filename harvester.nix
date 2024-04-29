let
  pkgs = import ./nixpkgs {};
in pkgs.mkShell {
  buildInputs = with pkgs; [
    nodejs_20
    docker-compose
  ];
}
