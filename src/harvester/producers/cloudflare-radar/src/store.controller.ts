import { Pool } from "pg";
import { DataPoint } from "./main";

const db_config = {
  user: 'postgres',
  password: 'postgres',
  host: 'postgres',
  port: 5432,
  database: 'postgres'
};

const pool = new Pool(db_config);

const storePingData = (data: DataPoint[]) => {
  for (const body of data) {
    let timestamp = body.timestamp;

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
        ${body.msm_id},
        '${body.dst_addr}',
        '${body.from}',
        '${body.country}',
        ${body.prb_id},
        '${JSON.stringify(body.result)}',
        '${timestamp}',
        'ping',
        ${body.step},
        ${body.sent},
        ${body.rcvd},
        '${body.source_platform}'
      );
    `;
    pool.query(query);
  }
};

export { storePingData };
