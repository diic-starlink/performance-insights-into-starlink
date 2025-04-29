# Breaking Through the Clouds: Performance Insights into Starlink's Latency and Packet Loss

<!-- Green Badges -->
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

Insights into the performance characteristics of the Starlink network. Contains various measurement types (Ping, Traceroute, HTTP, TLS, Satellite Numbers, Probe Disconnect Events, etc.).
Findings are summarized in the paper "Breaking Through the Clouds: Performance Insights into Starlink’s Latency and Packet Loss"

ISBN: 978-3-903176-72-0

## Components

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

