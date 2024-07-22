// For testing purposes.
const DROP_TABLES = true;
const DROP_QUERIES = `
  DROP TABLE IF EXISTS ping_data;
  DROP TABLE IF EXISTS disconnect_event_data;
  DROP TABLE IF EXISTS traceroute_data;
  DROP TABLE IF EXISTS satellite_data;
  DROP TABLE IF EXISTS tls_data;
  DROP TABLE IF EXISTS ripe_atlas_probe_data;
  DROP TABLE IF EXISTS http_data;
  DROP TABLE IF EXISTS http_result_data; 
`;

const SETUP_QUERIES = `
  CREATE TABLE IF NOT EXISTS ping_data (
    msm_id INTEGER,
    destination VARCHAR,
    source VARCHAR,
    result VARCHAR,
    country VARCHAR,
    prb_id INTEGER,
    timestamp VARCHAR,
    msm_type VARCHAR,
    step INTEGER,
    sent_packets INTEGER,
    received_packets INTEGER,
    source_platform VARCHAR
  );

  CREATE TABLE IF NOT EXISTS disconnect_event_data (
    timestamp INTEGER,
    stored_timestamp INTEGER,
    prb_id INTEGER,
    msm_id INTEGER,
    type VARCHAR,
    event VARCHAR,
    controller VARCHAR,
    asn INTEGER,
    prefix VARCHAR,
    prb_country VARCHAR,
    source_platform VARCHAR
  );

  CREATE TABLE IF NOT EXISTS traceroute_data (
    msm_id INTEGER,
    prb_id INTEGER,
    destination VARCHAR,
    source VARCHAR,
    protocol VARCHAR,
    af INTEGER,
    size INTEGER,
    paris_id INTEGER,
    result VARCHAR,
    destination_ip_responded BOOLEAN,
    timestamp INTEGER,
    source_platform VARCHAR
  );

  CREATE TABLE IF NOT EXISTS satellite_data (
    name VARCHAR,
    norad_id INTEGER,
    launch_date VARCHAR,
    decay_date VARCHAR,
    classification VARCHAR
  );

  CREATE TABLE IF NOT EXISTS tls_data (
    af INTEGER,
    dst_name VARCHAR,
    dst_port VARCHAR,
    src_name VARCHAR,
    method VARCHAR,
    msm_id INTEGER,
    msm_name VARCHAR,
    prb_id INTEGER,
    rt FLOAT,
    ttc FLOAT,
    timestamp INTEGER,
    source_platform VARCHAR
  );

  CREATE TABLE IF NOT EXISTS ripe_atlas_probe_data (
    id INTEGER,
    ipv4 VARCHAR,
    asn INTEGER,
    longitude FLOAT,
    latitude FLOAT,
    country VARCHAR
  );

  CREATE TABLE IF NOT EXISTS http_data (
    src VARCHAR,
    prb_id INTEGER,
    msm_id INTEGER
    timestamp INTEGER,
    uri VARCHAR
  );

  CREATE TABLE IF NOT EXISTS http_result_data (
    msm_id INTEGER,
    af INTEGER,
    bsize INTEGER,
    dst_addr VARCHAR,
    hsize INTEGER,
    method VARCHAR,
    http_status_code INTEGER,
    rt FLOAT
  );
`;

export {
  SETUP_QUERIES,
  DROP_TABLES,
  DROP_QUERIES
};
