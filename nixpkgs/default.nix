{}:

let
  hashes = import ./hashes.nix;
  ref = "nixos-24.05";
  hash = "0q96nxw7jg9l9zlpa3wkma5xzmgkdnnajapwhgb2fk2ll224rgs1";

  fetchCommit = fetchTarball {
    url = "https://github.com/NixOS/nixpkgs/archive/${ref}.tar.gz";
    sha256 = "${hash}";
  };
in

# Keep line 12 as it is! Only modify it by running update-default-nix.py. The updating script depends on the next line being as it is on line 12.
import fetchCommit { }
