{}:

let
  hashes = import ./hashes.nix;
  fetchCommit = commit: fetchTarball {
    url = "https://github.com/NixOS/nixpkgs/archive/${commit}.tar.gz";
    ${if hashes ? "${commit}" then "sha256" else null} = hashes.${commit}.hash;
  };
in

# Keep this line as it is! Only modify it by running update-default-nix.py.
import (fetchCommit "2a34566b67bef34c551f204063faeecc444ae9da") {

}
