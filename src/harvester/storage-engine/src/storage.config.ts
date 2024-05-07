const FILENAME = process.cwd() + '/data/duck.db'; // Use ':memory:' for in-memory database or filename for file-based database.
const DB_CONFIG = {
  "access_mode": "READ_WRITE",
  "max_memory": "8GB",
  "threads": 4
};

// For testing purposes.
const DROP_TABLES = true;
const DROP_QUERIES = `
  DROP TABLE IF EXISTS ping_data;
  DROP SEQUENCE IF EXISTS ping_data_id_seq;
`;

const SETUP_QUERIES = `
  CREATE SEQUENCE ping_data_id_seq START 1;

  CREATE TABLE IF NOT EXISTS ping_data (
    id INTEGER PRIMARY KEY DEFAULT nextval('ping_data_id_seq'),
    msm_id UINTEGER,
    destination VARCHAR,
    source VARCHAR,
    result VARCHAR,
    country VARCHAR,
    prb_id UINTEGER,
    timestamp VARCHAR,
    msm_type VARCHAR,
    step UINTEGER,
    sent_packets UINTEGER,
    received_packets UINTEGER,
    source_platform VARCHAR
  );
`;

export {
  FILENAME,
  DB_CONFIG,
  SETUP_QUERIES,
  DROP_TABLES,
  DROP_QUERIES
};
