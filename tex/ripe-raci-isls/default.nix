let
  pkgs = import ../../nixpkgs {};
in pkgs.stdenv.mkDerivation rec {
  pname = "ripe-raci-build";
  version = "0.0.1";

  src = ./.;

  buildInputs = with pkgs; [
    texliveFull
  ];

  buildPhase = ''
    export HOME=$(pwd)
    mkdir -p $out
    pdflatex main
  '';

  installPhase = ''
    mkdir -p $out
    cp main.pdf $out
  '';
}

