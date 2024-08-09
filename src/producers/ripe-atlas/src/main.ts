import assert from "assert";
import { ROOTSERVERS_BUILTIN_PING, ROOTSERVER_BUILTIN_DISCONNECT_EVENTS, ROOTSERVER_BUILTIN_DNS, ROOTSERVER_BUILTIN_HTTP, ROOTSERVER_BUILTIN_TLS, ROOTSERVER_BUILTIN_TRACEROUTE } from "./root_server_config";
import { START_TIMESTAMP, STOP_TIMESTAMP } from "./timeframe_config";
import { Probe, string_to_probestatus } from "./util";
import { Worker, isMainThread, workerData, parentPort } from "worker_threads";
import { storeDisconnectEventData, storeDnsData, storeHttpData, storePingData, storeProbeData, storeTlsData, storeTracerouteData } from "./store.controller";

const ASN = 14593;
const TIMEFRAME = 60 * 60 * 24; // 1 day in seconds
const RIPE_ATLAS_URL = "https://atlas.ripe.net/api"
const API = `${RIPE_ATLAS_URL}/v2`;

let start_timestamp: number;
let stop_timestamp: number;

enum SourcePlatforms {
	ping = 'RIPE ATLAS (builtin ping)',
	disconnect_event = 'RIPE ATLAS (builtin disconnect event)',
	traceroute = 'RIPE ATLAS (builtin traceroute)',
	tls = 'RIPE ATLAS (builtin tls)',
	http = 'RIPE ATLAS (builtin http)',
	dns = 'RIPE ATLAS (builtin dns)'
};

const ripe_up = async () => {
	const response = await fetch(RIPE_ATLAS_URL);
	if (response.status !== 200) {
		return false;
	}
	return true;
};

// TODO: Describe function
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
	const url = `${API}/probes/?asn_v4=${ASN}`;
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
				asn: ASN
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

		let current_timestamp = start_timestamp;
		while (current_timestamp < stop_timestamp) {
			const stop = Math.min(stop_timestamp, current_timestamp + TIMEFRAME);
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
					console.warn(`Was not able to parse JSON returned from ${url}.`);
				}
			}

			current_timestamp += TIMEFRAME;
		}
		// Ethical crawling.
		await new Promise((resolve) => setTimeout(resolve, 1000 * 1));
	}

};


interface Chunk {
	start_timestamp: number;
	stop_timestamp: number;
	ping_chunk: ProbeServerPair[];
	disconnect_event_chunk: ProbeServerPair[];
	traceroute_chunk: ProbeServerPair[];
	tls_chunk: ProbeServerPair[];
	http_chunk: ProbeServerPair[];
	dns_chunk: ProbeServerPair[];
};

const main = async (threads = 1) => {
	if (!(await ripe_up())) {
		console.error("RIPE ATLAS is down.");
		process.exit(1);
	}

	// Wait for 10 seconds to ensure that the database API is ready.
	await (new Promise((resolve) => { setTimeout(resolve, 10000) }));

	start_timestamp = START_TIMESTAMP;
	stop_timestamp = STOP_TIMESTAMP;

	console.log(`Start Timestamp: ${start_timestamp}`);
	console.log(`Stop Timestamp: ${stop_timestamp}`);

	assert(threads > 0, "Invalid number of threads");
	assert(start_timestamp < STOP_TIMESTAMP, "Invalid timeframe");
	assert(stop_timestamp < Date.now(), "Stop Timestamp is in the future. Choose something from the past.");

	// Splits the probe-server pairs into individual chunks.
	const chunks: Chunk[] = [];
	const probes: Probe[] = await get_starlink_probes();
	storeProbeData(probes);

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

	// TODO: Refactor that shit
	const ping_chunks: ProbeServerPair[][] = get_chunks(ROOTSERVERS_BUILTIN_PING);
	const de_chunks: ProbeServerPair[][] = get_chunks(ROOTSERVER_BUILTIN_DISCONNECT_EVENTS);
	const traceroute_chunks: ProbeServerPair[][] = get_chunks(ROOTSERVER_BUILTIN_TRACEROUTE);
	const tls_chunks: ProbeServerPair[][] = get_chunks(ROOTSERVER_BUILTIN_TLS);
	const http_chunks: ProbeServerPair[][] = get_chunks(ROOTSERVER_BUILTIN_HTTP);
	const dns_chunks: ProbeServerPair[][] = get_chunks(ROOTSERVER_BUILTIN_DNS);

	let dns_ctr = 0;
	let de_ctr = 0;
	let ping_ctr = 0;
	let traceroute_crt = 0;
	let tls_ctr = 0;
	let http_ctr = 0;
	while (de_chunks.length > de_ctr || ping_chunks.length > ping_ctr || traceroute_chunks.length > traceroute_crt || tls_chunks.length > tls_ctr || http_chunks.length > http_ctr || dns_chunks.length > dns_ctr) {
		const de_chunk: ProbeServerPair[] = (de_ctr < de_chunks.length) ? de_chunks[de_ctr] : [];
		const ping_chunk: ProbeServerPair[] = (ping_ctr < ping_chunks.length) ? ping_chunks[ping_ctr] : [];
		const traceroute_chunk: ProbeServerPair[] = (traceroute_crt < traceroute_chunks.length) ? traceroute_chunks[traceroute_crt] : [];
		const tls_chunk: ProbeServerPair[] = (tls_ctr < tls_chunks.length) ? tls_chunks[tls_ctr] : [];
		const http_chunk: ProbeServerPair[] = (http_ctr < http_chunks.length) ? http_chunks[http_ctr] : [];
		const dns_chunk: ProbeServerPair[] = (dns_ctr < dns_chunks.length) ? dns_chunks[dns_ctr] : [];

		chunks.push({
			start_timestamp: start_timestamp,
			stop_timestamp: stop_timestamp,
			ping_chunk: ping_chunk,
			disconnect_event_chunk: de_chunk,
			traceroute_chunk: traceroute_chunk,
			tls_chunk: tls_chunk,
			http_chunk: http_chunk,
			dns_chunk: dns_chunk
		});

		++de_ctr;
		++ping_ctr;
		++traceroute_crt;
		++tls_ctr;
		++http_ctr;
		++dns_ctr;
	}

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
				case SourcePlatforms.tls:
					storeTlsData(data);
					break;
				case SourcePlatforms.http:
					storeHttpData(data);
					break;
				case SourcePlatforms.dns:
					storeDnsData(data);
					break;
			}
		});
	}
	console.log('Work has been distributed among workers and workers start working now.');
};

interface ProbeServerSourcePair {
	chunk: ProbeServerPair[];
	source_platform: SourcePlatforms;
};

const workerMain = async () => {
	start_timestamp = workerData.start_timestamp;
	stop_timestamp = workerData.stop_timestamp;

	const chunks: ProbeServerSourcePair[] = [
		//{ chunk: workerData.ping_chunk, source_platform: SourcePlatforms.ping },
		//{ chunk: workerData.disconnect_event_chunk, source_platform: SourcePlatforms.disconnect_event },
		//{ chunk: workerData.traceroute_chunk, source_platform: SourcePlatforms.traceroute },
		//{ chunk: workerData.tls_chunk, source_platform: SourcePlatforms.tls },
		//{ chunk: workerData.http_chunk, source_platform: SourcePlatforms.http },
		{ chunk: workerData.dns_chunk, source_platform: SourcePlatforms.dns }
	].sort(() => 0.5 - Math.random()); // Shuffle the chunks.

	for (const chunk of chunks) {
		await download_and_store(chunk.chunk, chunk.source_platform);
	}
};

if (isMainThread) {
	main(16);
} else {
	workerMain();
}
