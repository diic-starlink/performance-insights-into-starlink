# Evaluating Resiliency and Performance of Networked Satellite Systems

A master's thesis aiming at researching of properties of network satellite
system. Especially, it puts an emphasis on Starlink satellite system.

<!-- Green Badges -->
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Checks](https://github.com/starlink-thesis-diic/starlink-thesis/actions/workflows/checks.yml/badge.svg)](https://github.com/starlink-thesis-diic/starlink-thesis/actions/workflows/checks.yml)
[![Deploy Artifacts](https://github.com/starlink-thesis-diic/starlink-thesis/actions/workflows/tex.yml/badge.svg)](https://github.com/starlink-thesis-diic/starlink-thesis/actions/workflows/tex.yml)

## Cloning the Repository

For the complete repository, including the ACM Paper Draft, use the following command:

```bash
git clone --recursive git@github.com:starlink-thesis-diic/starlink-thesis.git
```

If the ACM Paper Draft is not of interest, omit `--recursive` (however, not
really necessary as there are no dependencies between the submodule and other
components).

## Components

- `docs/`: Contains notes for the research. Does not contain any buildable files.
- `nixpkgs/`: Contains the Nix package manager configuration. Mainly, the
source of the packages references in the components.
- `src/db-controller`: The backend of the crawler system. It manages the
PostgreSQL database, a DB initializer, and the Jupyter Notebooks for analyzing
the data. It also contians the script for exporting the PostgreSQL data to
Parquet files that are used by Jupyter for faster analysis.
- `src/producers`: The crawlers for crawling the individual components. The
Cloudflare Radar producer might break, as CF Radar does not provide old data.
This is something that was not addressed in the end.
- `src/default.nix`: Main Nix file for running the components. Provides a
comprehensive way to run components in a Nix environment. Only a Docker
installation and Nix are required to run the components. Run `nix-shell src`
from the root of the repository to enter the Nix environment and look into the
provided help message to determine how to run the components.
- `tex/proposal`: Contains the proposal for the thesis. Run `nix-build` within
  this folder to build the proposal.
- `tex/thesis`: Contains the thesis itself. Run `nix-build` within this folder.
- `tex/acm-paper`: Contains the ACM Paper Draft. Run `nix-build` within this
  folder to build the ACM Paper Draft.

The project works well on GitHub AND GitLab. Both environments can be used to
build the project.

## Existing Artifacts

As mentioned, the data is packed into Parquet files. These files are stored on
a private Nextcloud. Please contact the author Robert Richter <robert.richter
at rrcomtech dot com> to get access to the data. We are happy to provide them
free of charge for anyone. The data cannot be given to third parties without
accreditation to the author.
