// For testing purposes.
const DROP_TABLES = true;
const DROP_QUERIES = `
  DROP TABLE IF EXISTS ping_data;
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
`;

export {
  SETUP_QUERIES,
  DROP_TABLES,
  DROP_QUERIES
};
