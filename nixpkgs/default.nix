{}:

let
  hashes = import ./hashes.nix;
  fetchCommit = commit: fetchTarball {
    url = "https://github.com/NixOS/nixpkgs/archive/${commit}.tar.gz";
    ${if hashes ? "${commit}" then "sha256" else null} = hashes.${commit}.hash;
  };
in

# Keep line 12 as it is! Only modify it by running update-default-nix.py. The updating script depends on the next line being as it is on line 12.
import (fetchCommit "aac35007254b1e84d387a78e31f2fefd6dd59e52") {

}
