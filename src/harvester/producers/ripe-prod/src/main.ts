import assert from "assert";
import fs from 'fs';
import { ROOTSERVERS_BUILTIN_PING } from "./root_server_config";
import { START_TIMESTAMP, STOP_TIMESTAMP } from "./timeframe_config";
import { Probe, string_to_probestatus } from "./util";
import { Worker, isMainThread, workerData, parentPort } from "worker_threads";
import { StoreController } from "./store.controller";

const URL = "https://atlas.ripe.net/api/v2/";
const ASN = 14593;
const TIMEFRAME = 60 * 60 * 24; // 1 day in seconds

let db: StoreController;

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

interface ProbeServerPair {
	server: number;
	probe: Probe;
};

const download_and_store = async (chunk: ProbeServerPair[]) => {
	const API = "https://atlas.ripe.net/api/v2";
	for (const pair of chunk) {
		const probe = pair.probe;
		const server = pair.server;

		let current_timestamp = START_TIMESTAMP;
		while (current_timestamp < STOP_TIMESTAMP) {
			const stop_timestamp = Math.min(STOP_TIMESTAMP, current_timestamp + TIMEFRAME);

			const probe_id = probe.id;
			const url = `${API}/measurements/${server}/results/?probe_ids=${probe_id}&start=${current_timestamp}&stop=${stop_timestamp}`;

			// Calls fetch and handles 429 and other errors.
			// Take care that RIPE ATLAS employs rate limiting.
			const fetch_data = async (url: string): Promise<any> => {
				try {
					const response = await fetch(url);
					if (response.status === 429) {
						await new Promise((resolve) => setTimeout(resolve, 2000));
						return await fetch_data(url);
					}
					return response
				} catch (error) {
					{
						await new Promise((resolve) => setTimeout(resolve, 5000));
					}
					return await fetch_data(url);
				}
			};
			const response = await fetch_data(url);

			if (response.status !== 200) {
				console.error(`Failed to fetch data from ${url}`);
			} else {
				// For some reason, some data points return an empty array.
				const data = await response.json();
				if (data.length === 0) {
					//console.error(`No data found for probe ${probe_id} and server ${server}. URL: ${url}`);
				} else {
					// Sending points individually, as the whole body might be too large.
					for (let point of data) {
						point.source_platform = "RIPE ATLAS (builtin)";
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

const main = async (threads = 1) => {
	if (!(await ripe_up())) {
		console.error("RIPE ATLAS is down.");
		process.exit(1);
	}

	assert(threads > 0, "Invalid number of threads");
	assert(START_TIMESTAMP < STOP_TIMESTAMP, "Invalid timeframe");
	assert(STOP_TIMESTAMP < Date.now(), "Stop Timestamp is in the future. Choose something from the past.");

	await db.prepareDatabase();

	// Splits the probe-server pairs into individual chunks.
	const chunks = [];
	{
		const probes: Probe[] = await get_starlink_probes();
		let probe_server_pair: ProbeServerPair[] = [];
		for (const server of ROOTSERVERS_BUILTIN_PING) {
			for (const probe of probes) {
				probe_server_pair.push({ server, probe });
			}
		}

		const chunk_size = Math.ceil(probe_server_pair.length / threads);
		for (let i = 0; i < probe_server_pair.length; i += chunk_size) {
			chunks.push(probe_server_pair.slice(i, i + chunk_size));
		}
		console.log(`Got a total of ${probe_server_pair.length} probe-server pairs split into ${chunks.length} chunks.`);
		console.log(`Length of first chunk: ${chunks[0].length}`);
	}

	for (const chunk of chunks) {
		// Spawns a new worker that will download and send the data.
		const worker = new Worker(__filename, { workerData: chunk });
		worker.on('message', (data) => {
			db.storePingData(data);
		});
	}
};

const print_memory_usage = async () => {
	{
		await (new Promise((resolve) => setTimeout(resolve, 1000)));
		const memory_usage = process.memoryUsage().heapUsed / 1024 / 1024;
		process.stdout.write("  " + Math.round(memory_usage) + " MB\r");
	}
	print_memory_usage();
};

if (isMainThread) {
	db = new StoreController();
	main(256);
	print_memory_usage();
} else {
	download_and_store(workerData);
}
