{
  description = "Starlink Thesis Flake";

  inputs = {
    nixpkgs = {
      url = "github:nixos/nixpkgs?ref=nixos-23.11";
    };
  };

  outputs = { 
    self, 
    nixpkgs 
  }: let 
    system = "aarch64-darwin";
    pkgs = import nixpkgs { inherit system; };
  in {
    packages.${system} = {
      hugo = pkgs.callPackage ./nix/hugo.nix {};
      default = self.packages.${system}.hugo;
    };
  };
}
