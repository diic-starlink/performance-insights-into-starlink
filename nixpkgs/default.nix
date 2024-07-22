{}:

let
  hashes = import ./hashes.nix;
  fetchCommit = commit: fetchTarball {
    url = "https://github.com/NixOS/nixpkgs/archive/${commit}.tar.gz";
    ${if hashes ? "${commit}" then "sha256" else null} = hashes.${commit}.hash;
  };
in

# Keep line 12 as it is! Only modify it by running update-default-nix.py. The updating script depends on the next line being as it is on line 12.
import (fetchCommit "a5eaa1df106c7847ce8b94a9cc66c51028030893") {

}
