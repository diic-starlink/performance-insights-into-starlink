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

/**
 * Store data in the database.
 *
 * @param data The data to store in object (not string) format.
 * @param endpoint The endpoint to store the data in. Does not have a leading slash.
 */
const storeData = (sat_data: Satellite) => {
  if (!sat_data.norad_id) sat_data.norad_id = -1;

  const query = `
    INSERT INTO satellite_data (
      name,
      norad_id,
      launch_date,
      decay_date,
      classification
    ) VALUES (
      '${sat_data.name}',
      ${sat_data.norad_id},
      '${sat_data.launch_date}',
      '${sat_data.decay_date}',
      '${sat_data.classification}'
    );
  `;

  pool.query(query);
};

export { storeData };
