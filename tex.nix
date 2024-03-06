with import <nixpkgs> {};

stdenv.mkDerivation {
  pname = "starlinkThesisBuild";
  version = "0.0.1";

  src = ./thesis;

  buildInputs = [
    texliveFull
  ];

  buildPhase = ''
    export HOME=$(pwd)
    mkdir -p $out

    pdflatex main.tex
  '';

  installPhase = ''
    mkdir -p $out
    cp main.pdf $out
  '';
}

