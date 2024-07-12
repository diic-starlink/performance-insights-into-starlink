import { Pool } from "pg";
import { DisconnectEventData, PingData, Probe, TLSData, TracerouteData } from "./util";

const db_config = {
  user: 'postgres',
  password: 'postgres',
  host: 'postgres',
  port: 5432,
  database: 'postgres'
};

const pool = new Pool(db_config);

const storePingData = (data: PingData[]) => {
  for (const body of data) {
    let timestamp = body.timestamp;
    if (timestamp === undefined) {
      // If timestamp not provided, use the current time.
      timestamp = new Date().toISOString();
    }
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

const storeDisconnectEventData = (data: DisconnectEventData[]) => {
  for (const body of data) {
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
    pool.query(query);
  }
};

const storeTracerouteData = (data: TracerouteData[]) => {
  for (const body of data) {
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
          destination_ip_responded,
          source_platform
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
          ${responded},
          '${body.source_platform}'
        );
      `;

    pool.query(query);
  }
};

const storeTlsData = (data: TLSData[]) => {
  for (const body of data) {
    const rt = body.rt ? body.rt : 0;
    const ttc = body.ttc ? body.ttc : 0;
    let af = 0;
    if (body.msm_id === 14001 || body.msm_id === 14002) af = 4;
    if (body.msm_id === 15001 || body.msm_id === 15002) af = 6;

    const query = `
      INSERT INTO tls_data (
        af,
        dst_name,
        dst_port,
        src_name,
        method,
        msm_id,
        msm_name,
        prb_id,
        rt,
        ttc,
        source_platform
      ) VALUES (
        ${af},
        '${body.dst_name}',
        '${body.dst_port}',
        '${body.from}',
        '${body.method}',
        ${body.msm_id},
        '${body.msm_name}',
        ${body.prb_id},
        ${rt},
        ${ttc},
        '${body.source_platform}'
      );
    `;

    pool.query(query);
  }
};

const storeProbeData = (data: Probe[]) => {
  for (const probe of data) {
    const query = `
      INSERT INTO ripe_atlas_probe_data (
        id,
        ipv4,
        asn,
        longitude,
        latitude,
        country
      ) VALUES (
        ${probe.id},
        '${probe.ipv4}',
        ${probe.asn},
        ${probe.geometry[0]},
        ${probe.geometry[1]},
        '${probe.country}'
      );
    `;

    pool.query(query);
  }
};

export { storePingData, storeDisconnectEventData, storeTracerouteData, storeTlsData, storeProbeData };
