import assert from "assert";
import { ROOTSERVERS_BUILTIN_PING, ROOTSERVER_BUILTIN_DISCONNECT_EVENTS } from "./root_server_config";
import { START_TIMESTAMP, STOP_TIMESTAMP } from "./timeframe_config";
import { Probe, ProbeStatus, string_to_probestatus } from "./util";
import { Worker, isMainThread, workerData, parentPort } from "worker_threads";
import { storeDisconnectEventData, storePingData } from "./store.controller";

const URL = "https://atlas.ripe.net/api/v2/";
const ASN = 14593;
const TIMEFRAME = 60 * 60 * 24; // 1 day in seconds
const API = "https://atlas.ripe.net/api/v2";

const ripe_up = async () => {
	const response = await fetch(URL);
	if (response.status !== 200) {
		return false;
	}
	return true;
};

const fetch_data = async (url: string): Promise<any> => {
	try {
		const response = await fetch(url);
		if (response.status === 429) {
			await new Promise((resolve) => setTimeout(resolve, 2000));
			return await fetch_data(url);
		}
		return response;
	} catch (error) {
		{
			await new Promise((resolve) => setTimeout(resolve, 5000));
		}
		return await fetch_data(url);
	}
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

interface ProbeServerPair {
	server: number;
	probe: Probe;
};

const download_and_store_disconnect_event = async (chunk: ProbeServerPair[]) => {
	for (const pair of chunk) {
		const probe = pair.probe;
		const server = pair.server;

		let current_timestamp = START_TIMESTAMP;
		while (current_timestamp < STOP_TIMESTAMP) {
			const stop = Math.min(STOP_TIMESTAMP, current_timestamp + TIMEFRAME);
			const prb_id = probe.id;

			const url = `${API}/measurements/${server}/results/?probe_ids=${prb_id}&start=${current_timestamp}&stop=${stop}&format=json`;
			const response = await fetch_data(url);
			if (response.status !== 200) {
				console.error(`Failed to fetch data from ${url}.`);
			} else {
				let data = await response.json();
				if (data.length > 0) {
					for (let point of data) {
						point.source_platform = 'RIPE ATLAS (builtin disconnection events)';
						point.country = probe.country;
					}
					parentPort.postMessage(data);
				}
			}

			current_timestamp += TIMEFRAME;
		}
	}
};

const download_and_store_ping = async (chunk: ProbeServerPair[]) => {
	for (const pair of chunk) {
		const probe = pair.probe;
		const server = pair.server;

		let current_timestamp = START_TIMESTAMP;
		while (current_timestamp < STOP_TIMESTAMP) {
			const stop_timestamp = Math.min(STOP_TIMESTAMP, current_timestamp + TIMEFRAME);

			const probe_id = probe.id;
			const url = `${API}/measurements/${server}/results/?probe_ids=${probe_id}&start=${current_timestamp}&stop=${stop_timestamp}`;
			const response = await fetch_data(url);

			if (response.status !== 200) {
				console.error(`Failed to fetch data from ${url}`);
			} else {
				let data = await response.json();
				if (data.length > 0) {
					// Sending points individually, as the whole body might be too large.
					for (let point of data) {
						point.source_platform = "RIPE ATLAS (builtin latency)";
						point.country = probe.country;
					}
					parentPort.postMessage(data);
				}
			};
			current_timestamp += TIMEFRAME;
			// Ethical crawling
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	}
};

interface Chunk {
	ping_chunk: ProbeServerPair[];
	disconnect_event_chunk: ProbeServerPair[];
};

const main = async (threads = 1) => {
	if (!(await ripe_up())) {
		console.error("RIPE ATLAS is down.");
		process.exit(1);
	}

	assert(threads > 0, "Invalid number of threads");
	assert(START_TIMESTAMP < STOP_TIMESTAMP, "Invalid timeframe");
	assert(STOP_TIMESTAMP < Date.now(), "Stop Timestamp is in the future. Choose something from the past.");

	// Splits the probe-server pairs into individual chunks.
	const chunks: Chunk[] = [];
	const probes: Probe[] = await get_starlink_probes();

	const ping_chunks: ProbeServerPair[][] = [];
	{
		let probe_server_pairs: ProbeServerPair[] = [];
		for (const server of ROOTSERVERS_BUILTIN_PING) {
			for (const probe of probes) {
				probe_server_pairs.push({ server, probe });
			}
		}

		const chunk_size = Math.ceil(probe_server_pairs.length / threads);
		for (let i = 0; i < probe_server_pairs.length; i += chunk_size) {
			ping_chunks.push(probe_server_pairs.slice(i, i + chunk_size));
		}
	}

	const de_chunks: ProbeServerPair[][] = [];
	{
		let probe_server_pairs: ProbeServerPair[] = [];
		for (const server of ROOTSERVER_BUILTIN_DISCONNECT_EVENTS) {
			for (const probe of probes) {
				probe_server_pairs.push({ server, probe });
			}
		}

		const chunk_size = Math.ceil(probe_server_pairs.length / threads);
		for (let i = 0; i < probe_server_pairs.length; i += chunk_size) {
			de_chunks.push(probe_server_pairs.slice(i, i + chunk_size));
		}
	}

	let de_ctr = 0;
	let ping_ctr = 0;
	while (de_chunks.length > de_ctr || ping_chunks.length > ping_ctr) {
		let de_chunk: ProbeServerPair[] = [];
		let ping_chunk: ProbeServerPair[] = [];
		if (de_ctr < de_chunks.length) de_chunk = de_chunks[de_ctr];
		if (ping_ctr < ping_chunks.length) ping_chunk = ping_chunks[ping_ctr];

		chunks.push({
			ping_chunk: ping_chunk,
			disconnect_event_chunk: de_chunk
		});

		++de_ctr;
		++ping_ctr;
	}

	// Wait for 10 seconds to ensure that the database API is ready.
	await (new Promise((resolve) => { setTimeout(resolve, 10000) }));

	for (const chunk of chunks) {
		// Spawns a new worker that will download and send the data.
		const worker = new Worker(__filename, { workerData: chunk });
		worker.on('message', (data) => {
			const source_platform = data[0].source_platform;
			if (source_platform.includes('latency')) storePingData(data);
			if (source_platform.includes('disconnection event')) storeDisconnectEventData(data);
		});
	}
};

if (isMainThread) {
	main(256);
} else {
	download_and_store_ping(workerData.ping_chunk);
	download_and_store_disconnect_event(workerData.disconnect_event_chunk);
}
