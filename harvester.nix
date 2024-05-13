let
  pkgs = import ./nixpkgs {};
in pkgs.stdenv.mkDerivation {
  pname = 'Harvester';
  version = "0.1.0";

  src = ./src/harvester/;

  buildInputs = with pkgs; [
    docker-compose
  ];

  installPhase = ''
    mkdir -p $out
    cp -r $src $out/harvester
  '';
}
