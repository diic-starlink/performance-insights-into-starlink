import { Pool } from "pg";
import { DROP_QUERIES, DROP_TABLES, SETUP_QUERIES } from "./storage.config";

export class StoreController {
  private pool: Pool;

  private db_config = {
    user: 'postgres',
    password: 'postgres',
    host: 'postgres',
    port: 5432,
    database: 'postgres'
  };

  constructor() {
    this.prepareDatabase();
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
