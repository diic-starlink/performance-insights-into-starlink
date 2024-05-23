import assert from "assert";
import KafkaProducer from "./kafka-producer";
import { ROOTSERVERS_BUILTIN_PING, ROOTSERVER_BUILTIN_TRACEROUTE } from "./root_server_config";
import { START_TIMESTAMP, STOP_TIMESTAMP } from "./timeframe_config";
import { Probe, string_to_probestatus } from "./util";

const TOPIC = "measurements";

const URL = "https://atlas.ripe.net/api/v2/";
const ASN = 14593;
const TIMEFRAME = 60 * 60 * 24; // 1 day; Feasible timeframe as tested in Postman.

const ripe_up = async () => {
	const response = await fetch(URL);
	if (response.status !== 200) {
		return false;
	}
	return true;
};

/**
 * Get all probes on RIPE ATLAS that have a Starlink ASNv4.
 * For each probe, a Probe Object is created.
 *
 * @returns
 * 		Returns a list of probes.
 */
const get_starlink_probes = async (): Promise<Probe[]> => {
	const url = URL + "probes/?asn_v4=" + ASN;
	let response = await (await fetch(url)).json();

	const probes: Probe[] = [];
	while (probes.length < response.count) {
		for (const probe of response.results) {
			probes.push({
				country: probe.country_code,
				geometry: probe.geometry.coordinates,
				id: probe.id,
				status: string_to_probestatus(probe.status.name),
				ipv4: probe.address_v4,
			});
		}

		if (response.next) {
			response = await (await fetch(response.next)).json();
		} else {
			break;
		}
	}

	return probes;
};

const main = async () => {
	if (!(await ripe_up())) {
		console.error("RIPE ATLAS is down.");
		process.exit(1);
	}

	assert(START_TIMESTAMP < STOP_TIMESTAMP, "Invalid timeframe");
	assert(STOP_TIMESTAMP < Date.now(), "Stop Timestamp is in the future. Choose something from the past.");

	const probes = await get_starlink_probes();
	const kafka_producer = new KafkaProducer(TOPIC);
	await kafka_producer.connect();

	const API = "https://atlas.ripe.net/api/v2";

	let current_timestamp = START_TIMESTAMP;
	while (current_timestamp < STOP_TIMESTAMP) {
		const stop_timestamp = Math.min(STOP_TIMESTAMP, current_timestamp + TIMEFRAME);
		for (const server of ROOTSERVERS_BUILTIN_PING) {
			for (const probe of probes) {
				const probe_id = probe.id;
				const url = `${API}/measurements/${server}/results/?probe_ids=${probe_id}&start=${current_timestamp}&stop=${stop_timestamp}`;

				const response = await fetch(url);
				if (response.status !== 200) {
					console.error(`Failed to fetch data from ${url}`);
					continue;
				}

				const data = await response.json();
				for (const point of data) {
					kafka_producer.send(JSON.stringify(point));
				}
			}
		}
		current_timestamp += TIMEFRAME;
	}

	process.on('exit', () => {
		kafka_producer.disconnect();
	});
};

main();
