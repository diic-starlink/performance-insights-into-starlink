import { readFileSync } from "fs";

// For testing purposes.
const DROP_TABLES = true;
const DROP_QUERIES = readFileSync('./sql/delete_queries.sql', 'utf8');
const SETUP_QUERIES = readFileSync('./sql/setup_queries.sql', 'utf8');

export {
  SETUP_QUERIES,
  DROP_TABLES,
  DROP_QUERIES
};
