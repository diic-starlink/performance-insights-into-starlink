# Storage Engine for Data Harvester

This is storage engine for adding a data-endpoint in order to provide an API that permanently stores data in a database.

It uses DuckDB as the database engine. Nest is used as a framework for the REST API.

## REST API Description

```
POST /
```

Returns 1. Can be used to determine whether the server is running.

```
POST /store/ping
```

Parameters:
- JSON object with the following fields:
    - `msm_id` (int): Measurement ID
    - `destination` (string): Destination IP address
    - `source` (string): Source IP address
    - `result` (string): Result of the ping. Will not be interpreted by the server.
    - `timestamp` (string) *optional*: Timestamp of the measurement in ISO 8601 format. If not provided, the server will use the current time.
    - `step` (int): Seconds step at which the measurement was repeated.
    - `sent_packets` (int): Number of packets sent.
    - `received_packets` (int): Number of packets received.

Return Type:
- `Success` if the data was stored successfully.
- `Failed` else.
