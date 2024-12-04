From
	Robert Richter
	December 4, 2024
	Thesis: "Breaking Through the Clouds: Performance Insights into
	Starlink’s Latency and Packet Loss"



		Given Parquet Files

The thesis is based mostly on the contents of the following Parquet files:

- disconnect_event_data.parquet
- http_data.parquet
- http_result_data.parquet
- ping_data.parquet
- ripe_atlas_probe_data.parquet
- satellite_date.parquet
- tls_data.parquet
- traceroute_data.parquet

Parquet files are a file format allowing quick analysis of large amounts of
data. They are advantageous over OLTP databases (e.g., PostgreSQL, MySQL).

It has to be noted that Parquet files DO NOT include any schema data from the
original DB schema. Each files works independently of the other files.




		The Data Origins


The DB contains data from RIPE Atlas, Cloudflare Radar, and N2YO.

1. RIPE Atlas:

	The provided data originates from built-in measurements from probes
	that held ASN14593 at starting time of measurement. The timeframe is
	January 2022 to June 2024.

2. Cloudflare Radar:

	The provided data was pulled for the past 6 months of start of
	measurement. The data only includes aggregates as Cloudflare Radar does
	not provide raw data.

3. N2YO:

	N2YO provides data about satellites. Specifically, we wanted to
	determine the number of satellites per constellation. The data was
	crawled via HTML.




		The Data Schema


1. disconnect_event_data.parquet

┌────────────┬──────────────────┬────────┬────────┬────────────┬─────────┬────────────┬───────┬──────────────────┬─────────────┬───────────────────────────────────────┐
│ timestamp  │ stored_timestamp │ prb_id │ msm_id │    type    │  event  │ controller │  asn  │      prefix      │ prb_country │            source_platform            │
│   int32    │      int32       │ int32  │ int32  │  varchar   │ varchar │  varchar   │ int32 │     varchar      │   varchar   │                varchar                │
├────────────┼──────────────────┼────────┼────────┼────────────┼─────────┼────────────┼───────┼──────────────────┼─────────────┼───────────────────────────────────────┤
│ 1670527197 │       1670527246 │  62741 │   7000 │ connection │ connect │ ctr-nue22  │ 14593 │ 216.147.120.0/21 │ US          │ RIPE ATLAS (builtin disconnect event) │
└────────────┴──────────────────┴────────┴────────┴────────────┴─────────┴────────────┴───────┴──────────────────┴─────────────┴───────────────────────────────────────┘

2. http_data.parquet

┌──────────────────────────────────────┬────────────────┬─────────┬────────┬────────────┬─────────────────────────────────┬───────────────────────────┐
│               data_id                │      src       │ prb_id  │ msm_id │ timestamp  │               uri               │      source_platform      │
│               varchar                │    varchar     │  int32  │ int32  │   int32    │             varchar             │          varchar          │
├──────────────────────────────────────┼────────────────┼─────────┼────────┼────────────┼─────────────────────────────────┼───────────────────────────┤
│ 1ef4825a-4b59-6c50-af5c-31d5d9c163d4 │ 206.83.114.215 │ 1004453 │  12023 │ 1656492630 │ http://www.ripe.net/favicon.ico │ RIPE ATLAS (builtin http) │
└──────────────────────────────────────┴────────────────┴─────────┴────────┴────────────┴─────────────────────────────────┴───────────────────────────┘

3. http_result_data.parquet

┌──────────────────────────────────────┬───────┬────────┬───────┬──────────────┬───────┬─────────┬──────────────────┬────────────┐
│               data_id                │  af   │ msm_id │ bsize │   dst_addr   │ hsize │ method  │ http_status_code │     rt     │
│               varchar                │ int32 │ int32  │ int32 │   varchar    │ int32 │ varchar │      int32       │   double   │
├──────────────────────────────────────┼───────┼────────┼───────┼──────────────┼───────┼─────────┼──────────────────┼────────────┤
│ 1ef4825a-4b59-6c50-af5c-31d5d9c163d4 │     4 │  12023 │     0 │ 104.18.21.44 │   556 │ GET     │                  │ 147.658206 │
└──────────────────────────────────────┴───────┴────────┴───────┴──────────────┴───────┴─────────┴──────────────────┴────────────┘

4. ping_data.parquet

┌────────┬──────────────┬───────────────┬────────────────────────────────────────────────────────┬─────────┬────────┬────────────┬──────────┬───────┬──────────────┬──────────────────┬───────────────────────────┐
│ msm_id │ destination  │    source     │                         result                         │ country │ prb_id │ timestamp  │ msm_type │ step  │ sent_packets │ received_packets │      source_platform      │
│ int32  │   varchar    │    varchar    │                        varchar                         │ varchar │ int32  │  varchar   │ varchar  │ int32 │    int32     │      int32       │          varchar          │
├────────┼──────────────┼───────────────┼────────────────────────────────────────────────────────┼─────────┼────────┼────────────┼──────────┼───────┼──────────────┼──────────────────┼───────────────────────────┤
│   1017 │ 78.46.48.134 │ 86.164.87.228 │ [{"rtt":32.27859},{"rtt":32.215649},{"rtt":32.250974}] │ GB      │  35751 │ 1640995536 │ ping     │   240 │            3 │                3 │ RIPE ATLAS (builtin ping) │
└────────┴──────────────┴───────────────┴────────────────────────────────────────────────────────┴─────────┴────────┴────────────┴──────────┴───────┴──────────────┴──────────────────┴───────────────────────────┘

The ping_data also includes the Cloudflare Radar results, even if it is not
ping data. The origin is indicated in the column "source_platform".

5. ripe_atlas_probe_data.parquet

┌───────┬──────────────┬───────┬───────────┬──────────┬─────────┐
│  id   │     ipv4     │  asn  │ longitude │ latitude │ country │
│ int32 │   varchar    │ int32 │  double   │  double  │ varchar │
├───────┼──────────────┼───────┼───────────┼──────────┼─────────┤
│ 10743 │ 98.97.42.182 │ 14593 │ -122.9005 │  48.4885 │ US      │
└───────┴──────────────┴───────┴───────────┴──────────┴─────────┘

6. satellite_data.parquet

┌──────────┬──────────┬───────────────────────────────┬───────────────────────────────┬────────────────┐
│   name   │ norad_id │          launch_date          │          decay_date           │ classification │
│ varchar  │  int32   │            varchar            │            varchar            │    varchar     │
├──────────┼──────────┼───────────────────────────────┼───────────────────────────────┼────────────────┤
│ SL-1 R/B │        1 │ 1957-10-04T00:00:00.000+01:00 │ 1957-12-01T01:00:00.000+01:00 │ false          │
└──────────┴──────────┴───────────────────────────────┴───────────────────────────────┴────────────────┘

The data in this tables purely originates from N2YO and needs updating from
time to time.

7. tls_data.parquet

┌───────┬────────────────┬──────────┬────────────────┬─────────┬────────┬──────────┬─────────┬────────────┬────────────┬────────────┬──────────────────────────┐
│  af   │    dst_name    │ dst_port │    src_name    │ method  │ msm_id │ msm_name │ prb_id  │     rt     │    ttc     │ timestamp  │     source_platform      │
│ int32 │    varchar     │ varchar  │    varchar     │ varchar │ int32  │ varchar  │  int32  │   double   │   double   │   int32    │         varchar          │
├───────┼────────────────┼──────────┼────────────────┼─────────┼────────┼──────────┼─────────┼────────────┼────────────┼────────────┼──────────────────────────┤
│     4 │ atlas.ripe.net │ 443      │ 180.150.31.130 │ TLS     │  14002 │ SSLCert  │ 1004828 │ 514.880933 │ 256.740837 │ 1664818711 │ RIPE ATLAS (builtin tls) │
└───────┴────────────────┴──────────┴────────────────┴─────────┴────────┴──────────┴─────────┴────────────┴────────────┴────────────┴──────────────────────────┘

8. traceroute_data.parquet

┌────────┬────────┬──────────────┬────────────────┬──────────┬───────┬───────┬──────────┬────────────────────────────────────────────────────────────────────────────────────────────────────────────┬──────────────────────────┬────────────┬─────────────────────────────────┐
│ msm_id │ prb_id │ destination  │     source     │ protocol │  af   │ size  │ paris_id │                                                   result                                                   │ destination_ip_responded │ timestamp  │         source_platform         │
│ int32  │ int32  │   varchar    │    varchar     │ varchar  │ int32 │ int32 │  int32   │                                                  varchar                                                   │         boolean          │   int32    │             varchar             │
├────────┼────────┼──────────────┼────────────────┼──────────┼───────┼───────┼──────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────┼────────────┼─────────────────────────────────┤
│   5017 │  51475 │ 78.46.48.134 │ 81.107.107.204 │ UDP      │     4 │    40 │        1 │ [{"hop":1,"result":[{"from":"10.0.0.1","ttl":64,"size":68,"rtt":1.148},{"from":"10.0.0.1","ttl":64,"size…  │ false                    │ 1641004899 │ RIPE ATLAS (builtin traceroute) │
└────────┴────────┴──────────────┴────────────────┴──────────┴───────┴───────┴──────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────┴────────────┴─────────────────────────────────┘


Most of the attributes in the columns can be looked up in the RIPE Atlas
documentation. See https://atlas.ripe.net/docs/built-in-measurements/.



		Working with Parquet Files


Working with Parquet files can appear quite challenging in first glance, but is
actually supported by a variety of open-source tools. I recommend using the
DuckDB executable.

1. Looking at Data via a Browser: Deephaven

A rare, but sometimes helpful way, is to look at data via a browser. A
possibility is to run Deephaven Parquet Viewer for that (see
https://github.com/devinrsmith/deephaven-parquet-viewer). The standard way for
running the Viewer is to run it via Docker. It can view individual files, but
cannot view all Parquet files all together.

2. Looking at Data via an Application: DataGrip [UNTESTED]

A standard way to get started, is to use the DataGrip app from JetBrains. I did
not use this way, but I know JetBrains does a good job at those things.

3. Looking at Data via the Command Line: DuckDB [RECOMMENDED]

The most efficient way is to look at data using the DuckDB application.
Actually, DuckDB is also a standalone OLAP DB, but it can also read Parquet
files and query them. See https://duckdb.org/#quickinstall for installation.

One can query Parquet files with DuckDB like this:

$ duckdb
$ SELECT COUNT(*) from './tls_data.parquet';

One can use the Parquet files just like they'd be regular tables. Keep in mind,
the files do not share relationships anymore, like it would be the case in a DB
schema.

4. Looking at Data via Jupyter: DuckDB

Usually, data needs to pass some Jupyter notebook when performing analysis. I
strongly recommand using DuckDB here too, as this is the most efficient way.
The datasets might become large and therefore, memory is key here. DuckDB is
far better in managing this compared to Pandas (that also provides functions
for reading from Parquet files).

Querying in Jupyter works like so:

$ import duckdb
$
$ probes = duckdb.read_parquet('./parquet/ripe_atlas_probe_data.parquet')
$ df = duckdb.sql('SELECT COUNT(*) FROM probes;').to_df()

