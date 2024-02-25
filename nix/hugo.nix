{
  stdenv,
  hugo,
  ...
}: stdenv.mkDerivation {
  pname = "starlinkThesisPackage";
  version = "v0.0.1";
  src = "./src";

  buildPhase = ''
    ls -al
    exit 1
  '';
}
