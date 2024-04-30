import KafkaProducer from "./kafka-producer";
import { large_fetch } from "./large-data-processor/fetch";
import ROOTSERVERS from "./root_server_config";
import { START_TIMESTAMP, STOP_TIMESTAMP } from "./timeframe_config";
import { Measurement, Probe, ProbeStatus, string_to_probestatus, stringify_msms } from "./util";

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

/**
 * Check if a probe is connected.
 *
 * @param probe 
 * 		The probe to check. Only the probe ID is used.
 * @returns
 * 		Returns True, if the probe is connected and False is otherwise.
 */
const is_probe_up = async (probe: Probe) => {
	const response = await fetch(URL + "probes/" + probe.id);
	const status = string_to_probestatus((await response.json()).status.name);
	return status === ProbeStatus.CONNECTED;
}

const get_next_measurement_page = async (probe: Probe) => {
	const url = URL + "measurements";

	let measurements: Measurement[] = [];
	for (const ROOTSERVER of ROOTSERVERS) {
		const msm_url = `${url}/${ROOTSERVER}/results/?probe_ids=${probe.id}&start=${START_TIMESTAMP}&stop=${STOP_TIMESTAMP}&format=json`;

		const response = (await large_fetch(msm_url)) as any[];

		for (const msm of response) {
			measurements.push({
				measurement_id: msm.msm_id,
				probe_id: msm.prb_id,
				timestamp: msm.timestamp,
				from: msm.src_addr,
				to: msm.dst_addr,
				protocol: msm.proto,
				type: msm.type,
				group_id: msm.group_id,
				stored_timestamp: msm.stored_timestamp,
				qbuf: msm.qbuf,
				result: msm.result,
			});
		}
	}


	return measurements;
}

const main = async () => {
	if (!(await ripe_up())) {
		console.error("RIPE ATLAS is down.");
		process.exit(1);
	}


	const probes = await get_starlink_probes();

	// Wait for Kafka to be ready and finished its dumb leadership election.
	await new Promise(resolve => setTimeout(resolve, 20000));
	const kafka_producer = new KafkaProducer("measurements");
	await kafka_producer.connect();

	for (let i = 0; i < probes.length; i++) {
		const probe = probes[i];
		if (await is_probe_up(probe)) {
			console.log("Probe " + probe.id + " is up. Gathering built-in measurements.");
			const measurements = stringify_msms(await get_next_measurement_page(probe));

			await kafka_producer.produce(measurements);
		} else {
			console.log("Probe " + probe.id + " is down.");
		}
	}

	// Ethical crawling.
	kafka_producer.disconnect();
};

main();
