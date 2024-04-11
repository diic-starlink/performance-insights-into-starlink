import sys

f = open("default.nix", "r")
lines = f.readlines()

hash = sys.argv[1]
lines[10] = 'import (fetchCommit "' + hash + '") {'
f.close()

fw = open("default.nix", "w")
fw.writelines(lines)
