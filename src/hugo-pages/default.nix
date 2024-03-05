with import <nixpkgs> {};

stdenv.mkDerivation {
  pname = "starlinkThesisWebsiteBuild";
  version = "0.0.1";

  src = ./.;

  buildInputs = [
    hugo
  ];

  buildPhase = ''
    export HOME=$(pwd)
    mkdir -p $out

    hugo
    cp -r public/* $out
  '';
}
