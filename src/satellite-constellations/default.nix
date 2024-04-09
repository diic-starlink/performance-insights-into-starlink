with import <nixpkgs> {};

buildNpmPackage red {
	pname = "starlinkThesisSatConstBuild";
	version = "0.0.1";
	src = ./.;

	npmDepsHash = "";
}

stdenv.mkDerivation {
  pname = "starlinkThesisSatConstBuild";
  version = "0.0.1";

  src = ./.;

  buildInputs = [
    nodejs_21
  ];

  buildPhase = ''
    export HOME=$(pwd)
    mkdir -p $out

  ';
}
