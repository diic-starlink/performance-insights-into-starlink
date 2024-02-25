let
  nixPkgsUrl = fetchTarball "https://github.com/NixOS/nixpkgs/tarball/nixos-23.11";
  pkgs = import nixPkgsUrl { config = {}; overlays = []; };
in 

pkgs.mkShell {
  name = "starlink-thesis";

  packages = with pkgs; [
     nodejs_21
     hugo
  ];
}
