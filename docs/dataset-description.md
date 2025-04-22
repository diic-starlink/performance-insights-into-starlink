# Dataset Description

The dataset consists of various files that each describe one type of measurement. Each file is given as a Parquet files. They are organized just like columns of a database.
It is recommended to use DuckDB to access the data. This allows to query the data just like SQL. Using Pandas is also possible, but might be difficult if the Parquet file is larger than memory.

## Dataset Download

> [!CAUTION]
> The data is not yet accessible as there was no suitable location found yet.

## Data Files

The RIPE Atlas data formats usually follow the ones listed on the RIPE Atlas result data formats website.
- `disconnect_event_data.parquet`: RIPE Atlas data for diconnect events of Starlink probes.
- `http_data.parquet` & `http_result_data.parquet`: RIPE Atlas data for HTTP build-in measurements.
- `ping_data.parquet`: RIPE Atlas and Cloudflare Radar data for ping measurements. The Cloudflare Radar is aggregated.
- `ripe_atlas_probe_data.parquet`: Information about the Starlink probes used in the measurements.
- `satellite_data.parquet`: All satellites on N2YO until June 2024. Used to determine the numbers of satellites in each satellite constellation.
- `tls_data.parquet`: RIPE Atlas data about TLS measurements from Starlink probes.
- `traceroute_data.parquet`: RIPE Atlas data about traceroute measurement from Starlink probes.

All RIPE Atlas measurement are built-in measurements. That means they are executed at a fixed schedule toward mostly *.root-servers.org. For a reference to the built-in measurements, refer to [RIPE Atlas Built-In Measurements](https://atlas.ripe.net/docs/getting-started/built-in-measurements).

## Access to Data using DuckDB

Obtain it using e.g., Nix:

```bash
nix-shell -p duckdb
```

Than query the parquet files just like using SQL. For example, lets find the number of probes from the file `ripe_atlas_probe_data.parquet`.

```bash
duckdb -c "SELECT COUNT(*) FROM read_parquet('ripe_atlas_probe_data.parquet');"
┌──────────────┐
│ count_star() │
│    int64     │
├──────────────┤
│     146      │
└──────────────┘
```

One can also use the interactive terminal DuckDB provide when just running `duckdb`. For example, lets obtain the minimal and maximum RTT from `tls_data.parquet`:

```bash
D SELECT MAX(rt) FROM read_parquet('tls_data.parquet');
┌────────────┐
│  max(rt)   │
│   double   │
├────────────┤
│ 4994.26426 │
└────────────┘
D SELECT MIN(rt) FROM read_parquet('tls_data.parquet') WHERE rt > 0;
┌──────────┐
│ min(rt)  │
│  double  │
├──────────┤
│ 4.188641 │
└──────────┘
```

