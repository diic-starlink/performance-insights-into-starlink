import { Controller, Post, Req } from "@nestjs/common";
import { Pool } from "pg";
import { DROP_QUERIES, DROP_TABLES, SETUP_QUERIES } from "./storage.config";

@Controller('store')
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

  @Post('traceroute')
  async storeTracerouteData(@Req() request: Request): Promise<string> {
    const el_list = request.body as any;

    for (const body of el_list) {
      const responded = body.destination_ip_responded ? true : false;

      const query = `
        INSERT INTO traceroute_data (
          msm_id,
          prb_id,
          destination,
          source,
          protocol,
          af,
          size,
          paris_id,
          result,
          destination_ip_responded
        ) VALUES (
          ${body.msm_id},
          ${body.prb_id},
          '${body.dst_addr}',
          '${body.from}',
          '${body.proto}',
          ${body.af},
          ${body.size},
          ${body.paris_id},
          '${JSON.stringify(body.result)}',
          ${responded}
        );
      `;

      await this.pool.query(query);
    }

    return 'Sucess';
  }

  @Post('disconnect_event')
  async storeDisconnectEventData(@Req() request: Request): Promise<string> {
    const el_list = request.body as any;

    for (const body of el_list) {
      // Some responses do not contain a valid ASN.
      if (!body.asn) body.asn = 14593;

      const query = `
      INSERT INTO disconnect_event_data (
        timestamp,
        stored_timestamp,
        prb_id,
        msm_id,
        type,
        event,
        controller,
        asn,
        prefix,
        prb_country,
        source_platform
      ) VALUES (
        ${body.timestamp},
        ${body.stored_timestamp},
        ${body.prb_id},
        ${body.msm_id},
        '${body.type}',
        '${body.event}',
        '${body.controller}',
        ${body.asn},
        '${body.prefix}',
        '${body.country}',
        '${body.source_platform}'
      )
      `;

      await this.pool.query(query);
    }

    return 'Success';
  }

  @Post('ping')
  async storePingData(@Req() request: Request): Promise<string> {
    const el_list = request.body as any;

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
      )
      VALUES (
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
    return "Success";
  }
}
