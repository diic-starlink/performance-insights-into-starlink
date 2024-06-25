import assert from "assert";
import { ROOTSERVERS_BUILTIN_PING, ROOTSERVER_BUILTIN_DISCONNECT_EVENTS, ROOTSERVER_BUILTIN_TRACEROUTE } from "./root_server_config";
import { START_TIMESTAMP, STOP_TIMESTAMP } from "./timeframe_config";
import { Probe, string_to_probestatus } from "./util";
import { Worker, isMainThread, workerData, parentPort } from "worker_threads";
import { storeDisconnectEventData, storePingData, storeTracerouteData } from "./store.controller";

const URL = "https://atlas.ripe.net/api/v2/";
const ASN = 14593;
const TIMEFRAME = 60 * 60 * 24; // 1 day in seconds
const API = "https://atlas.ripe.net/api/v2";

enum SourcePlatforms {
	ping = 'RIPE ATLAS (builtin ping)',
	disconnect_event = 'RIPE ATLAS (disconnect event)',
	traceroute = 'RIPE ATLAS (builtin traceroute)'
};

const ripe_up = async () => {
	const response = await fetch(URL);
	if (response.status !== 200) {
		return false;
	}
	return true;
};

const fetch_data = async (url: string, retries = 3): Promise<Response> => {
	try {
		const response = await fetch(url);
		if (response.status === 429 && retries > 0) {
			await new Promise((resolve) => setTimeout(resolve, 2000));
			return await fetch_data(url, retries - 1);
		}
		return response;
	} catch (error) {
		console.error('Failed fetching data.');
		return undefined;
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

const download_and_store = async (chunk: ProbeServerPair[], source_platform: string) => {
	for (const pair of chunk) {
		const probe = pair.probe;
		const server = pair.server;

		let current_timestamp = START_TIMESTAMP;
		while (current_timestamp < STOP_TIMESTAMP) {
			const stop = Math.min(STOP_TIMESTAMP, current_timestamp + TIMEFRAME);
			const prb_id = probe.id;

			const url = `${API}/measurements/${server}/results/?probe_ids=${prb_id}&start=${current_timestamp}&stop=${stop}&format=json`;
			const response = await fetch_data(url);
			if (response?.status !== 200) {
				console.error(`Failed to fetch data from ${url}.`);
			} else {
				try {
					const data = await response.json();
					if (data.length > 0) {
						for (const point of data) {
							point.source_platform = source_platform;
							point.country = probe.country;
						}
						parentPort.postMessage(data);
					}
				} catch (e) {
					console.warn('Was not able to parse JSON returned from ${url}.');
				}
			}

			current_timestamp += TIMEFRAME;
		}
		// Ethical crawling
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}

};


interface Chunk {
	ping_chunk: ProbeServerPair[];
	disconnect_event_chunk: ProbeServerPair[];
	traceroute_chunk: ProbeServerPair[];
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

	const get_chunks = (servers: number[]): ProbeServerPair[][] => {
		const probe_server_pairs: ProbeServerPair[] = [];
		for (const server of servers) {
			for (const probe of probes) {
				probe_server_pairs.push({ server, probe });
			}
		}

		const res: ProbeServerPair[][] = [];
		const chunk_size = Math.ceil(probe_server_pairs.length / threads);
		for (let i = 0; i < probe_server_pairs.length; i += chunk_size) {
			res.push(probe_server_pairs.slice(i, i + chunk_size));
		}

		return res;
	};

	const ping_chunks: ProbeServerPair[][] = get_chunks(ROOTSERVERS_BUILTIN_PING);
	const de_chunks: ProbeServerPair[][] = get_chunks(ROOTSERVER_BUILTIN_DISCONNECT_EVENTS);
	const traceroute_chunks: ProbeServerPair[][] = get_chunks(ROOTSERVER_BUILTIN_TRACEROUTE);

	let de_ctr = 0;
	let ping_ctr = 0;
	let traceroute_crt = 0;
	while (de_chunks.length > de_ctr || ping_chunks.length > ping_ctr || traceroute_chunks.length > traceroute_crt) {
		let de_chunk: ProbeServerPair[] = [];
		let ping_chunk: ProbeServerPair[] = [];
		let traceroute_chunk: ProbeServerPair[] = [];
		if (de_ctr < de_chunks.length) de_chunk = de_chunks[de_ctr];
		if (ping_ctr < ping_chunks.length) ping_chunk = ping_chunks[ping_ctr];
		if (traceroute_crt < traceroute_chunks.length) traceroute_chunk = traceroute_chunks[traceroute_crt];

		chunks.push({
			ping_chunk: ping_chunk,
			disconnect_event_chunk: de_chunk,
			traceroute_chunk: traceroute_chunk
		});

		++de_ctr;
		++ping_ctr;
		++traceroute_crt;
	}

	// Wait for 10 seconds to ensure that the database API is ready.
	await (new Promise((resolve) => { setTimeout(resolve, 10000) }));

	for (const chunk of chunks) {
		// Spawns a new worker that will download and send the data.
		const worker = new Worker(__filename, { workerData: chunk });
		worker.on('message', (data) => {
			const source_platform = data[0].source_platform;
			switch (source_platform) {
				case SourcePlatforms.ping:
					storePingData(data);
					break;
				case SourcePlatforms.disconnect_event:
					storeDisconnectEventData(data);
					break;
				case SourcePlatforms.traceroute:
					storeTracerouteData(data);
					break;
			}
		});
	}
	console.log('Work has been distributed among workers and workers start working now.');
};

const workerMain = async () => {
	await download_and_store(workerData.ping_chunk, 'RIPE ATLAS (builtin ping)');
	await download_and_store(workerData.disconnect_event_chunk, 'RIPE ATLAS (builtin disconnect event)');
	await download_and_store(workerData.traceroute_chunk, SourcePlatforms.traceroute);
};

if (isMainThread) {
	main(256);
} else {
	workerMain();
}
