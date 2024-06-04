import pg from 'pg';
import { DROP_QUERIES, DROP_TABLES, SETUP_QUERIES } from "./storage.config";

const { Pool, Client } = pg;

export class StoreController {
  private db_config = {
    user: 'postgres',
    password: 'postgres',
    host: 'postgres',
    port: 5432,
    database: 'postgres'
  };

  private pool: any;

  async storePingData(el_list: any): Promise<void> {
    for (const body of el_list) {
      const msm_id = body.msm_id;
      const destination = body.dst_addr;
      const source = body.src_addr;
      const result = JSON.stringify(body.result);
      let timestamp = body.timestamp;
      if (timestamp === undefined) {
        // If timestamp not provided, use the current time.
        timestamp = new Date().toISOString();
      }
      const step = body.step;
      const sent_packets = body.sent;
      const received_packets = body.rcvd;
      const source_platform = body.source_platform;
      const country = body.country;
      const prb_id = body.prb_id;

      const query = `
        INSERT INTO ping_data (
          msm_id,
          destination,
          source,
          country,
          prb_id,
          result,
          timestamp,
          msm_type,
          step,
          sent_packets,
          received_packets,
          source_platform
        ) VALUES (
          ${msm_id},
          '${destination}',
          '${source}',
          '${country}',
          ${prb_id},
          '${result}',
          '${timestamp}',
          'ping',
          ${step},
          ${sent_packets},
          ${received_packets},
          '${source_platform}'
        );
      `;

      await this.pool.query(query);
    }
  }

  async prepareDatabase(): Promise<void> {
    const pool = new Pool(this.db_config);
    await pool.query('SELECT NOW()');
    console.log("Database ready ... Preparing the database ...");

    if (DROP_TABLES) {
      console.log("INFO: Storage Engine is configured to drop all tables before preparing the DB.");
      await pool.query(DROP_QUERIES);
    }
    await pool.query(SETUP_QUERIES);
    this.pool = pool;

    process.on('exit', () => {
      this.pool.end();
    });
    console.log("Database prepared.");
  }
}
