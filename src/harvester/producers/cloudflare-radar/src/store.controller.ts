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
    const timestamp = body.timestamp;

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

const getTableCount = async (): Promise<number> => {
  const query = `
    SELECT COUNT(*) FROM ping_data WHERE source_platform = 'Cloudflare RADAR (timeseries groups)';
  `;
  const result = await pool.query(query);
  return result.rows[0].count;
};

const getMaxTimestamp = async (): Promise<number> => {
  if (await getTableCount() === 0) return 0;
  const query = `
    SELECT MAX(timestamp) FROM ping_data WHERE source_platform = 'Cloudflare RADAR (timeseries groups)';
  `;
  const result = await pool.query(query);
  return result.rows[0].max;
};

export { storePingData, getTableCount, getMaxTimestamp };
