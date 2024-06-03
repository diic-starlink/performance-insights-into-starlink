import { Database as DuckDB } from "duckdb";
import { DROP_QUERIES, DROP_TABLES, FILENAME, SETUP_QUERIES } from "./storage.config";
import { existsSync, mkdir } from "fs";
import { dirname } from "path";

export class StoreController {
  private db: DuckDB;

  constructor() {
    const dname = dirname(FILENAME);
    console.log("Database file: " + dname);
    if (!existsSync(dname)) {
      mkdir(dname, { recursive: true }, (err) => {
        if (err) {
          console.error(err);
          console.error("Failed to create the database file. Terminating ...");
          process.exit(1);
        }
      });
    }

    // This should get an additional Database configuration object as an argument, which sadly does not work.
    this.db = new DuckDB(
      FILENAME,
      (err) => {
        if (err) {
          console.error(err);
          console.error("Failed to connect to the database. Terminating ...");
          process.exit(1);
        }
      }
    );

    process.on('exit', () => {
      this.db.close();
    });

    this.prepareDatabase();
  }

  storePingData(el_list: any): void {
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
        INSERT INTO ping_data(
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

      const conn = this.db.connect();
      conn.all(query);
      conn.close();
    }
  }


  prepareDatabase(): void {
    console.log("Preparing the database ...");

    if (DROP_TABLES) {
      console.log("INFO: Storage Engine is configured to drop all tables before preparing the DB.");
      this.db.all(DROP_QUERIES, (err, _) => {
        if (err) {
          console.error(err);
          console.error("Failed to drop tables. Terminating ...");
          process.exit(1);
        }
      });
    }

    this.db.all(SETUP_QUERIES, (err, _) => {
      if (err) {
        console.error(err);
        console.error("Failed to prepare the database. Terminating ...");
        process.exit(1);
      }
    });

    console.log("Database prepared.");
  }
}
