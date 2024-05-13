import KafkaProducer from "./kafka-producer";
import { ROOTSERVERS_BUILTIN_PING, ROOTSERVER_BUILTIN_TRACEROUTE } from "./root_server_config";
import { Probe, ProbeStatus, string_to_probestatus } from "./util";
import WebSocket from "ws";

const TOPIC = "measurements";

const URL = "https://atlas.ripe.net/api/v2/";
const ASN = 14593;

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
const get_starlink_probes = async () => {
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

	const probes = await get_starlink_probes();
	let probe: Probe;
	for (let i = 0; i < probes.length; ++i) {
		if (probes[i].status === ProbeStatus.CONNECTED) {
			probe = probes[i];
			break;
		}
	}

	let stream_configs: any[] = [];

	// TODO: Add sendBacklog parameter in order to cover the last few minutes of possible disconnects.
	for (const probe of probes) {
		for (const server of ROOTSERVERS_BUILTIN_PING) {
			const param = {
				streamType: "result",
				msm: server,
				type: "ping",
				prb: probe.id,
			};
			stream_configs.push(param);
		}
	}

	for (const probe of probes) {
		for (const server of ROOTSERVER_BUILTIN_TRACEROUTE) {
			const param = {
				streamType: "result",
				msm: server,
				type: "traceroute",
				prb: probe.id,
			};
			stream_configs.push(param);
		}
	}

	console.log(`Got a total of ${stream_configs.length} stream configurations.`);

	// Wait for Kafka to be ready and finished its dumb leadership election.
	await new Promise(resolve => setTimeout(resolve, 30000));

	const kafka_producer = new KafkaProducer(TOPIC);
	await kafka_producer.connect();

	const socket = new WebSocket("wss://atlas-stream.ripe.net/stream/");
	socket.onmessage = (event: any): void => {
		let [type, payload] = JSON.parse(event.data);

		if (type === "atlas_error") {
			console.warn(payload);
		}

		if (type === "atlas_result") {
			payload.source_platform = "RIPE ATLAS";
			const prb_id = payload.prb_id;
			let country = "Unknown";
			for (const probe of probes) {
				if (probe.id === prb_id) {
					country = probe.country;
					break;
				}
			}

			payload.country = country;
			kafka_producer.send(JSON.stringify(payload));
		}
	};

	socket.onopen = async (_: any): Promise<void> => {
		for (const config of stream_configs) {
			socket.send(JSON.stringify(["atlas_subscribe", config]));
			// Rate limit to 1 subscription per second.
			await new Promise(resolve => setTimeout(resolve, 500));
		}
		console.log("Subscribed to all builtin Starlink Measurements.");
	};

	process.on('exit', () => {
		socket.close();
		kafka_producer.disconnect();
	});
};

main();
