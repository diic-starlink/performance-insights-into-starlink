let
  pkgs = import ./nixpkgs {};
in pkgs.buildNpmPackage rec {
  pname = "satelliteNumbers";
  version = "0.0.1";

  npmDepsHash = "sha256-NLBJ7ntKUhP9sNm1t3jMUap+Jk/sQnA9lX34DcpZJSw=";

  src = ./src/satellite-constellations;
}

