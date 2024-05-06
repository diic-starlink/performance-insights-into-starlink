import { Controller, Post, Req } from "@nestjs/common";
import { Database as DuckDB } from "duckdb";
import { DB_CONFIG, DROP_QUERIES, DROP_TABLES, FILENAME, SETUP_QUERIES } from "./storage.config";

@Controller('store')
export class StoreController {
  private db: DuckDB;

  constructor() {
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

    this.prepareDatabase();
  }

  // Store RIPE ATLAS data in the DuckDB database
  @Post('ping')
  storePingData(@Req() request: Request): string {
    let status = "Success";

    const body = request.body as any;

    const msm_id = body.msm_id;
    const destination = body.destination;
    const source = body.source;
    const result = body.result;
    let timestamp = body.timestamp;
    if (timestamp === undefined) {
      // If timestamp not provided, use the current time.
      timestamp = new Date().toISOString();
    }
    const step = body.step;
    const sent_packets = body.sent_packets;
    const received_packets = body.received_packets;

    const conn = this.db.connect();
    conn.all(`
      INSERT INTO ping_data (
        msm_id,
        destination,
        source,
        result,
        timestamp,
        msm_type,
        step,
        sent_packets,
        received_packets
      )
      VALUES (
        ${msm_id},
        '${destination}',
        '${source}',
        '${result}',
        '${timestamp}',
        'ping',
        ${step},
        ${sent_packets},
        ${received_packets}
      );
    `, (err, _) => {
      if (err) {
        status = "Failed";
      }
    });

    conn.close();
    return status;
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
