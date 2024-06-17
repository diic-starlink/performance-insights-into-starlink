// For testing purposes.
const DROP_TABLES = true;
const DROP_QUERIES = `
  DROP TABLE IF EXISTS ping_data;
  DROP TABLE IF EXISTS disconnect_event_data;
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
`;

export {
  SETUP_QUERIES,
  DROP_TABLES,
  DROP_QUERIES
};
