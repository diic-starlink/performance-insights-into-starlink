import { Pool } from 'pg';
import { Satellite } from './util';

const db_config = {
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'postgres'
};

const pool = new Pool(db_config);
const table_name = "satellite_data";

/**
 * Store data in the database.
 *
 * @param data The data to store in object (not string) format.
 * @param endpoint The endpoint to store the data in. Does not have a leading slash.
 */
const storeData = async (sat_data: Satellite) => {
  if (!sat_data.norad_id) sat_data.norad_id = -1;

  // Determine whether satellite is already in DB.
  const in_db_query = {
    text: `SELECT COUNT(norad_id) FROM ${table_name} WHERE norad_id = $1;`,
    values: [sat_data.norad_id]
  };
  const res = (await pool.query(in_db_query)).rows[0];
  if (res.count > 0) {
    console.log(`Satellite ${sat_data.norad_id} is already present in DB. It will not be inserted again ...`);
    return;
  }

  const query = {
    text: `INSERT INTO satellite_data (name, norad_id, launch_date, decay_date, classification)
           VALUES($1,$2,$3,$4,$5);`,
    values: [
      sat_data.name,
      sat_data.norad_id,
      sat_data.launch_date,
      sat_data.decay_date,
      sat_data.classification
    ]
  }

  pool.query(query);
};

export { storeData };
