let 
  pkgs = import ./nixpkgs {};
in pkgs.stdenv.mkDerivation {
  pname = "starlinkThesisWebsiteBuild";
  version = "0.0.1";

  src = ./.;

  buildInputs = with pkgs; [
    hugo
  ];

  buildPhase = ''
    export HOME=$(pwd)
    mkdir -p $out

    cd src/hugo-pages/
    hugo
    cp -r public/* $out
  '';
}
