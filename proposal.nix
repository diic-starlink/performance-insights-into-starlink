let
  pkgs = import ./nixpkgs {};
in pkgs.stdenv.mkDerivation {
  pname = "proposalBuild";
  version = "0.0.1";

  src = ./proposal;

  buildInputs = with pkgs; [
    texliveFull
    biber
  ];

  buildPhase = ''
    export HOME=$(pwd)
    mkdir -p $out

    pdflatex main
    biber main
    pdflatex main
    pdflatex main
  '';

  installPhase = ''
    mkdir -p $out
    cp main.pdf $out
  '';
}

