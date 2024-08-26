{
  description = "Thesis Starlink Flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
  };

  outputs = { self, nixpkgs }: let
    supportedSystems = [ "aarch64-darwin" "x86_64-linux" ];
    forAllSystems = nixpkgs.lib.genAttrs supportedSystems;

    nixpkgsFor = forAllSystems (system: import nixpkgs { inherit system; });
  in {
    packages = forAllSystems (system:
      let
        pkgs = nixpkgsFor.${system};
      in {
        # Define packages callable by
        #   nix run .#packagename

        thesis = pkgs.stdenv.mkDerivation {
          pname = "starlinkThesisBuild";
          version = "1.0.0";

          src = ./tex/thesis;

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
        };
      });
  };
}
